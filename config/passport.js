const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const adminSchema = require("../model/adminSchema");
const bcrypt = require("bcryptjs");

module.exports = passportAuth = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, function (
      email,
      password,
      done
    ) {
      adminSchema.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, {
            message: "email or password not matched.",
          });
        }
        if (!user.password) {
          return done(null, false, {
            message: '"email or password not matched.',
          });
        }

        if (user) {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err)
              return done(null, false, {
                message: "email or password not matched.",
              });
            if (isMatch) {
              console.log(isMatch);
              return done(null, user);
            } else {
              console.log(isMatch);

              return done(null, false, {
                message: "email or password not matched.",
              });
            }
          });
        }
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    adminSchema.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
