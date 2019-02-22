const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const actionsRouter = require('./routers/actionsRouter');
const studentRouter = require('./routers/studentRouter');
const professorRouter = require('./routers/professorRouter');

const port = process.env.PORT || 3000;

/*
String.prototype.hashCode = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        let character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};
*/

const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'CourseWorkDatabase',
    schema: {
        tableName: 'userSession',
        columnNames: {
            session_id: 'sessionId',
            expires: 'expires',
            data: 'data'
        }
    }
};

const sessionStore = new MySQLStore(options);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use('/', actionsRouter);
app.use('/student', studentRouter);
app.use('/professor', professorRouter);

app.listen(port, () => console.log(`Server has been started on port ${port}!`));