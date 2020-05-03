const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
/**
* An HTTP endpoint that acts as a webhook for Slack command event
* @param {object} event
* @returns {object} result Your return value
*/
module.exports = async (event) => {
// Store API Responses
const result = {slack: {}, airtable: {}};

    console.log(`Running [Airtable → Select Rows by querying a Base]...`);
    result.airtable.selectDate = await lib.airtable.query['@0.4.5'].select({
      table: `Dates`,
      where: [
        {
          'wasSent__is': true,
          'Status__is': `pending`
        }
      ]
    });
    console.log(`Running [Airtable → Select Rows by querying a Base]...`);
    result.airtable.selectUser = await lib.airtable.query['@0.4.5'].select({
      table: `Members`, // required
      where: [
        {
        'user_id': `${event.user_id}`
      }
      ],
    });
    let user = result.airtable.selectUser.rows[0].id;
    let date = result.airtable.selectDate.rows[0].id;
   
    console.log(user);
    console.log(result.airtable.selectDate);
    console.log(result.airtable.selectUser);
  
    
    console.log(`Running [Airtable → Select Rows by querying a Base]...`);
    result.airtable.QueryResult = await lib.airtable.query['@0.4.5'].select({
        table: `Replies`, // required
        where: [
            {
            'Respondent__is': user,
            'Date__is': date
        }
        ]
    });
    console.log(`Running [Airtable → Insert Rows into a Base]...`);
    if (result.airtable.QueryResult.rows.length === 0) {
  result.airtable.insertQueryResults = await lib.airtable.records['@0.2.1'].create({
    table: `Replies`,
    fields: {
      'Reply': `${event.text}`,
      'Respondent': [user],
      'Date': [date]
    }
  });
  
  }

  return result;
};