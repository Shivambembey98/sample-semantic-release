const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const knex = require("../db/db");

const secretKey = process.env.JWT_SECRET_KEY;
const option = {};
option.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
option.secretOrKey = secretKey;
option.passReqToCallback = true;
option.ignoreExpiration = true;

module.exports = (passport) => {
   passport.use(new JwtStrategy(option, async (req,jwt_payload,done) => {
      try {
         const to = new Date();
         const today = Math.ceil(to.getTime() / 1000);
         if (jwt_payload.exp < today) {
            return done(null, "Unauthorize");
         }
         const user = await knex("users").where({ id: jwt_payload.id })
            .first();
         if (!user) {
            return done(null,false,"User not found");
         }
         return done(null,user);

      } catch (error) {
         return done(error, false);
      }
   }));
};
