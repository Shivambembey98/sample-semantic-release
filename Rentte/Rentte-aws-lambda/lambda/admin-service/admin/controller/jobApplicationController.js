const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { GET_ALL_JOB_APPLICATION } = LOGGER_MESSAGES
module.exports = {
   getAllJobApplications: async (req,res) => {
      try {
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const totalCountResult = await knex('jobapplications')
            .count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         const jobApplications = await knex('jobapplications')
            .select('*')
            .limit(limit)
            .orderBy('created_at', 'desc');
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            jobApplications,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_ALL_JOB_APPLICATION(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message,res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);   
      }
   },
}
