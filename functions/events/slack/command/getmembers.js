const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

/**
* An HTTP endpoint that acts as a webhook for Slack command event
* @param {object} event
* @returns {object} result Your return value
*/
module.exports = async (event) => {

  // Store API Responses
const result = {slack: {}};

  console.log(`Running [Slack → List all users]...`);
  result.slack.returnValue = await lib.slack.users['@0.3.32'].list({
    include_locale: true,
    limit: 100
  });
  
  console.log(`Running [Airtable → Insert Rows into a Base]...`);
  for (var i = 0; i < result.slack.returnValue.members.length; i++) {
  await lib.airtable.query['@0.4.5'].insert({
    table: `Members`,
    fieldsets: [
      {
        'real_name': `${result.slack.returnValue.members[i].profile.real_name}`,
        'user_id': `${result.slack.returnValue.members[i].id}`
      }
    ]
  });
  }
  
  return result;

};