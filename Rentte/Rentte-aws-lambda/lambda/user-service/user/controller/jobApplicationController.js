const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { APPLY_JOBS } = LOGGER_MESSAGES
module.exports = {
   applyJobs: async (req,res) => {
      try {
         const { name,email,phone, experience, dob,jobtype } = req.body
         if (!name) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "name is required",
               operation: APPLY_JOBS().OPERATION,
               context: APPLY_JOBS(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",
               "name"), res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!email) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "email is required",
               operation: APPLY_JOBS().OPERATION,
               context: APPLY_JOBS(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",
               "email"), res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!phone) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "phone is required",
               operation: APPLY_JOBS().OPERATION,
               context: APPLY_JOBS(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",
               "phone"), res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!experience) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "experience is required",
               operation: APPLY_JOBS().OPERATION,
               context: APPLY_JOBS(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",
               "experience"), res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!dob) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "dob is required",
               operation: APPLY_JOBS().OPERATION,
               context: APPLY_JOBS(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",
               "dob"), res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!jobtype) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "jobtype is required",
               operation: APPLY_JOBS().OPERATION,
               context: APPLY_JOBS(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",
               "jobtype"), res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const jobApplicationData = {
            name,
            email,
            phone,
            experience,
            dob,
            jobtype,
            resume: req.file.key,
         };
         await knex("jobapplications").insert(jobApplicationData);
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);

      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: APPLY_JOBS(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
}
