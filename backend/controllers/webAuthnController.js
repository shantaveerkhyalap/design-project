const SimpleWebAuthnServer = require('@simplewebauthn/server');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// RP (Relying Party) Configuration
const rpName = 'Agricultural App';
const rpID = 'localhost'; // Change to your production domain later
const origin = `http://${rpID}:3000`; // Frontend Origin

const generateRegistrationOptions = async (req, res) => {
    const userId = req.user._id; // From authMiddleware

    const user = await User.findById(userId);

    const options = await SimpleWebAuthnServer.generateRegistrationOptions({
        rpName,
        rpID,
        userID: user._id.toString(),
        userName: user.email,
        attestationType: 'none',
        // prevent re-registering existing authenticators
        excludeCredentials: user.authenticators.map(auth => ({
            id: auth.credentialID,
            type: 'public-key',
            transports: auth.transports,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform', // TouchID/FaceID like features
        },
    });

    // Save challenge to DB
    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
};

const verifyRegistration = async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const body = req.body;

    let verification;
    try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = registrationInfo;

        const newAuthenticator = {
            credentialID: Buffer.from(credentialID).toString('base64url'), // Encode ID
            credentialPublicKey,
            counter,
            transports: body.response.transports,
        };

        user.authenticators.push(newAuthenticator);
        user.currentChallenge = undefined;
        await user.save();

        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false, error: 'Verification failed' });
    }
};

const generateAuthenticationOptions = async (req, res) => {
    // For login, we don't know the user yet if they are using passkeys only.
    // BUT for simplicity, let's assume a flow where they enter email first, OR logged in user adds a device.
    // Let's assume standard flow: Email first -> Get Challenge.

    // NOTE: For true passwordless, you'd need a "discoverable credential" flow which is complex.
    // We will stick to: User enters email -> we look up user -> send challenge.

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const options = await SimpleWebAuthnServer.generateAuthenticationOptions({
        rpID,
        allowCredentials: user.authenticators.map(auth => ({
            id: Buffer.from(auth.credentialID, 'base64url'), // Decode ID
            type: 'public-key',
            transports: auth.transports,
        })),
        userVerification: 'preferred',
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
};

const verifyAuthentication = async (req, res) => {
    const { email } = req.body; // In a real app, you might pass email or use session
    const user = await User.findOne({ email });

    const body = req.body;

    // Find the authenticator in DB that matches the one used
    const authenticator = user.authenticators.find(auth =>
        auth.credentialID === body.id
    );

    if (!authenticator) {
        return res.status(400).json({ error: 'Authenticator not found' });
    }

    let verification;
    try {
        verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
                credentialPublicKey: authenticator.credentialPublicKey,
                counter: authenticator.counter,
                transports: authenticator.transports,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        // Update counter
        authenticator.counter = authenticationInfo.newCounter;
        user.currentChallenge = undefined;
        await user.save();

        // Generate JWT (Same as login)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: '30d',
        });

        res.json({
            verified: true, token, user: {
                _id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } else {
        res.status(400).json({ verified: false });
    }
};

module.exports = {
    generateRegistrationOptions,
    verifyRegistration,
    generateAuthenticationOptions,
    verifyAuthentication
};
