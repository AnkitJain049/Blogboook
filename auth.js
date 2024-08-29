import passport from 'passport';
import { Strategy } from 'passport-local';
import { Blog, User } from './models.js';

passport.use(new Strategy({ usernameField: 'username' },async (username, password, done) => {
            try {
                const user = await User.findOne({ username: username });
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }

                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);
// Serialize user to the session
passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user.username); // Store email in session
});

// Deserialize user from the session
passport.deserializeUser(async (username, done) => {
    console.log('Deserializing user with username:', username);
    try {
        const user = await User.findOne({ username: username });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;