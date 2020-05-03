  const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
  
  /**
  * An HTTP endpoint that acts as a webhook for Scheduler daily event
  * @returns {object} result Your return value
  */
  
  module.exports = async () => {
    
  // Store API Responses
  const result = {airtable: {}, slack: {}};
  
  console.log(`Running [Airtable → Retrieve Distinct Values by querying a Base]...`);
    result.airtable.distinctQueryResult = await lib.airtable.query['@0.4.5'].distinct({
      table: `Members`,
      field: `user_id`,
      limit: {
        'count': 0,
        'offset': 0
      },
    });
    
  const momentTimezone = require('moment-timezone'); // https://momentjs.com/timezone/docs/
  let date = momentTimezone().tz('America/Los_Angeles'); //sets the timezone of the date object to 'America/Los_Angeles'
  let formatted_date = date.format('YYYY-MM-DD');
  
  console.log(formatted_date);
  
  console.log(`Running [Airtable → Select Rows by querying a Base]...`);
    result.airtable.selectQueryResult = await lib.airtable.query['@0.4.5'].select({
    table: `Dates`,
    where: [
    {
    'Date__is': formatted_date,
    'wasSent__is_null': true,
    'Status__is': `pending`
    }
    ],
    limit: {
    'count': 0,
    'offset': 0
    }
    });
    
  console.log(result.airtable.selectQueryResult);
  
  console.log(`Running [Slack → retrieve channel by name ]}`);
  result.slack.channel = await lib.slack.channels['@0.6.6'].retrieve({
    channel: `#random`
  });
  
  console.log(result.slack.channel);
  
  console.log(`Running [Slack → Create a new Ephemeral Message from your Bot]...`);
  for (var i = 0; i < result.airtable.distinctQueryResult.distinct.values.length; i++){
    
  await lib.slack.messages['@0.5.11'].ephemeral.create({
    channelId: `${result.slack.channel.id}`,
    userId: `${result.airtable.distinctQueryResult.distinct.values[i]}`,
    text: `What tasks are you working on for week of ${result.airtable.selectQueryResult.rows[0].fields.Date}? \n Please reply using \/cmd record:`,
    as_user: false
  });
    }
    
  console.log(`Running airtable.query[@0.3.3].update()...`);
  result.updateQueryResult = await lib.airtable.query['@0.4.5'].update({
    table: `Dates`, // required
    where: [
      {
        Date: `${result.airtable.selectQueryResult.rows[0].fields.Date}`
      }
    ],
    fields: {
      wasSent: true
    }
  });

  return result;

};