/* eslint max-len: 0 */

import { Strategy as FacebookStrategy } from 'passport-facebook';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import config from '../config';
import User from '../models/user';

export default (passport) => {
  // Serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id
    }, (err, user) => {
      user.email = null;
      user.facebook = null;
      user.hashed_password = null;
      done(err, user);
    });
  });

  // Use google strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_APP_ID,
    clientSecret: process.env.GOOGLE_APP_SECRET,
    callbackURL: `${config.app.url}/auth/google/callback`
  },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        email: profile.emails[0].value
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.displayName,
            password: profile.id,
            profileImage: profile._json.picture,
            provider: 'google',
            google: profile._json
          });
          user.save((err) => {
            if (err) return err;
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })));


  // Use facebook strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${config.app.url}/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'displayName', 'name', 'picture.type(large)']
  },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        email: profile.emails[0].value
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          const rand1 = Math.floor(Math.random() * 9);
          const rand2 = Math.floor(Math.random() * 100);
          const username = `${profile.name.givenName}${profile.name.familyName}${rand1}${rand2}`;
          user = new User({
            name: profile.displayName,
            email: (profile.emails && profile.emails[0].value) || '',
            username,
            provider: 'facebook',
            profileImage: (profile.photos && profile.photos[0].value) || '',
            facebook: profile._json,
            password: 'undefined'
          });
          user.save((err) => {
            if (err) return (err);
            user.facebook = null;
            return done(err, user);
          });
        } else {
          user.facebook = null;
          return done(err, user);
        }
      });
    })));
};
