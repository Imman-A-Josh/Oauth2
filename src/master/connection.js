
// const mysql = require("mysql");
const mysql = require("mysql");
const MySQLEvents = require("@rodrigogs/mysql-events");
const dbConfig = require("../config/db.config");


exports.changesInDatabase =(socket,io)=>{
 
var conn = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DATABASE,
  multipleStatements:dbConfig.multipleStatements
});

module.exports = conn;

const program = async () => {
  const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DATABASE,
    multipleStatements:dbConfig.multipleStatements
  });

  const instance = new MySQLEvents(connection, {
    startAtEnd: true,
    excludedSchemas: {
      mysql: true,
    },
  });

  await instance.start();

  instance.addTrigger({
    name: 'admin',
    expression: 'admin.*',
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: (event) => { // You will receive the events here
      socket.emit('message',event)
      console.log(event);
      
    },
  });
  
  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
  .then(() => console.log('Waiting for database events...'))
  .catch(console.error);
}