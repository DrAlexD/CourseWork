const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const path = require('path');

const port = process.env.PORT || 3000;

String.prototype.hashCode = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        let character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

const con = mysql.createConnection({
    user: "root",
    password: "123456",
    database: "CourseWorkDatabase"
});

con.connect(err => err ? console.error(err) : console.log("MySQL database connected!"));

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

app.get('/', (req, res) => {
    res.redirect('/login');
    res.end();
});

app.get('/login', (req, res) => {
    if (typeof req.session.username == 'undefined')
        res.sendFile(path.join(__filename, '../pages/log_in_page.html'));
    else {
        console.log(`Active session: ${req.session.username}`);
        res.redirect('/actions');
        res.end();
    }
});

app.post('/login', (req, res) => {
    if (req.body.username !== "" && req.body.password !== "") {
        con.query(`SELECT login FROM student WHERE login='${req.body.username}' AND password='${req.body.password}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (req.body.username === "root") {
                        if (req.body.password === "root") {
                            req.session.username = "root";
                            console.log(`Success log in: ${req.session.username}`);
                            res.sendStatus(200);
                            res.end();
                        } else {
                            res.status(404).send(JSON.stringify("Wrong password for user: root"));
                            console.log("Wrong password for user: root");
                        }
                    } else {
                        if (typeof result[0] != 'undefined') {
                            req.session.username = result[0].login;
                            console.log(`Success log in: ${req.session.username}`);
                            res.sendStatus(200);
                            res.end();
                        } else {
                            res.status(404).send(JSON.stringify("Wrong login or password"));
                            console.log("Wrong login or password");
                        }
                    }
                }
            });
    } else {
        res.status(404).send(JSON.stringify("Undefined login or password"));
        console.log("Undefined login or password");
    }
});

app.get('/logout', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        console.log(`Success log out: ${req.session.username}`);
        req.session.destroy();
        res.end();
    }
});

app.get('/actions', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        console.log(`Actions page, user: ${req.session.username}`);
        res.sendFile(path.join(__filename, '../pages/actions_page.html'));
    } else {
        console.log(`Actions page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

app.get('/add/student', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        console.log(`AddStudent page, user: ${req.session.username}`);
        res.sendFile(path.join(__filename, '../pages/add_student_page.html'));
    } else {
        console.log(`AddStudent page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

app.post('/add/student', (req, res) => {
    if (req.body.firstName !== "" && req.body.secondName !== "" && req.body.studentGroup !== "") {
        let log = `${req.body.firstName} ${req.body.secondName}`.replace(" ", "").toLowerCase();
        log += (req.body.studentGroup).slice(-2);
        let pas = `123456`;
        con.query("INSERT INTO student (`firstName`, `secondName`, `group`, `login`, `password`) " + `VALUES ('${req.body.firstName}', '${req.body.secondName}', '${req.body.studentGroup}', '${log}', '${pas}')`,
            function (err1) {
                if (err1) {
                    console.error(err1);
                    res.status(500).send(JSON.stringify("Copy of existing student"));
                } else {
                    console.log(`Success added student: ${log}`);

                    con.query(`SELECT studentId FROM student WHERE login='${log}'`,
                        function (err2, result) {
                            if (err2)
                                console.error(err2);
                            else {
                                res.status(200).send(`${result[0].studentId}`);
                                res.end();
                            }
                        });
                }
            }
        );
    } else {
        res.status(404).send(JSON.stringify("Undefined firstName or secondName or group"));
        console.log("Undefined firstName or secondName or group");
    }
});

app.get('/add/professor', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        console.log(`AddProfessor page, user: ${req.session.username}`);
        res.sendFile(path.join(__filename, '../pages/add_professor_page.html'));
    } else {
        console.log(`AddProfessor page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

app.post('/add/professor', (req, res) => {
    if (req.body.firstName !== "" && req.body.secondName !== "") {
        let log = `${req.body.firstName} ${req.body.secondName}`.replace(" ", "").toLowerCase();
        let pas = `123456`;
        con.query("INSERT INTO professor (`firstName`, `secondName`, `login`, `password`) " + `VALUES ('${req.body.firstName}', '${req.body.secondName}', '${log}', '${pas}')`,
            function (err1) {
                if (err1) {
                    console.error(err1);
                    res.status(500).send(JSON.stringify("Copy of existing professor"));
                } else {
                    console.log(`Success added professor: ${log}`);

                    con.query(`SELECT professorId FROM professor WHERE login='${log}'`,
                        function (err2, result) {
                            if (err2)
                                console.error(err2);
                            else {
                                res.status(200).send(`${result[0].professorId}`);
                                res.end();
                            }
                        });
                }
            }
        );
    } else {
        res.status(404).send(JSON.stringify("Undefined firstName or secondName"));
        console.log("Undefined firstName or secondName");
    }
});
app.get('/student/:id', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM student WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../pages/student_page.html'));
                        console.log(`Student page, student: ${result[0].login}`);
                    } else {
                        console.log(`Not found student`);
                        res.redirect('/actions');
                        res.end();
                    }
                }
            });
    } else {
        console.log(`Student page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

app.get('/student/:id/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM student WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.send(JSON.stringify(result[0]));
                    } else {
                        console.log(`Not found student: ${result[0].login}`);
                        res.redirect('/actions');
                        res.end();
                    }
                }
            });
    } else {
        res.redirect('/login');
        res.end();
    }
});

app.get('/professor/:id', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM professor WHERE professorId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../pages/professor_page.html'));
                        console.log(`Professor page, professor: ${result[0].login}`);
                    } else {
                        console.log(`Not found professor`);
                        res.redirect('/actions');
                        res.end();
                    }
                }
            });
    } else {
        console.log(`Professor page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

app.get('/professor/:id/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM professor WHERE professorId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.send(JSON.stringify(result[0]));
                    } else {
                        console.log(`Not found professor: ${result[0].login}`);
                        res.redirect('/actions');
                        res.end();
                    }
                }
            });
    } else {
        res.redirect('/login');
        res.end();
    }
});

app.get('/students', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        res.sendFile(path.join(__filename, '../pages/students_page.html'));
        console.log(`Students page, user: ${req.session.username}`);
    } else {
        console.log(`Students page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

app.get('/students/all.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM student`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.send(JSON.stringify(result));
                    } else {
                        console.log(`Not found students`);
                        res.redirect('/actions');
                        res.end();
                    }
                }
            });
    } else {
        res.redirect('/login');
        res.end();
    }
});

app.post('/students', (req, res) => {
    if (req.body.firstName !== "") {
        if (req.body.secondName !== "") {
            if (req.body.studentGroup !== "") {
                con.query(`SELECT * FROM student WHERE firstName='${req.body.firstName}' AND secondName='${req.body.secondName}' AND group='${req.body.studentGroup}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).send(JSON.stringify(result));
                            } else {
                                console.log(`Not found students`);
                                res.status(404).send(JSON.stringify(`Not found students`));
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM student WHERE firstName='${req.body.firstName}' AND secondName='${req.body.secondName}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).send(JSON.stringify(result));
                            } else {
                                console.log(`Not found students`);
                                res.status(404).send(JSON.stringify(`Not found students`));
                            }
                        }
                    }
                );
            }
        } else {
            if (req.body.studentGroup !== "") {
                con.query(`SELECT * FROM student WHERE firstName='${req.body.firstName}' AND group='${req.body.studentGroup}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).send(JSON.stringify(result));
                            } else {
                                console.log(`Not found students`);
                                res.status(404).send(JSON.stringify(`Not found students`));
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM student WHERE firstName='${req.body.firstName}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).send(JSON.stringify(result));
                            } else {
                                console.log(`Not found students`);
                                res.status(404).send(JSON.stringify(`Not found students`));
                            }
                        }
                    }
                );
            }
        }
    } else {
        if (req.body.secondName !== "") {
            if (req.body.studentGroup !== "") {
                con.query(`SELECT * FROM student WHERE secondName='${req.body.secondName}' AND group='${req.body.studentGroup}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).send(JSON.stringify(result));
                            } else {
                                console.log(`Not found students`);
                                res.status(404).send(JSON.stringify(`Not found students`));
                            }
                        }
                    }
                );
            } else {
                con.query(`SELECT * FROM student WHERE secondName='${req.body.secondName}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).send(JSON.stringify(result));
                            } else {
                                console.log(`Not found students`);
                                res.status(404).send(JSON.stringify(`Not found students`));
                            }
                        }
                    }
                );
            }
        } else {
            if (req.body.studentGroup !== "") {
                con.query(`SELECT * FROM student WHERE group='${req.body.studentGroup}'`,
                    function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (typeof result[0] != 'undefined') {
                                res.status(200).send(JSON.stringify(result));
                            } else {
                                console.log(`Not found students`);
                                res.status(404).send(JSON.stringify(`Not found students`));
                            }
                        }
                    }
                );
            } else {
                res.status(404).send(JSON.stringify("Undefined firstName and secondName and group"));
                console.log("Undefined firstName and secondName and group");
            }
        }
    }
});

app.get('/professors', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        res.sendFile(path.join(__filename, '../pages/professors_page.html'));
        console.log(`Professors page, user: ${req.session.username}`);
    } else {
        console.log(`Professors page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

app.get('/professors/all.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM professor`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.send(JSON.stringify(result));
                    } else {
                        console.log(`Not found professors`);
                        res.redirect('/actions');
                        res.end();
                    }
                }
            });
    } else {
        res.redirect('/login');
        res.end();
    }
});

app.post('/professors', (req, res) => {
    if (req.body.firstName !== "") {
        if (req.body.secondName !== "") {
            con.query(`SELECT * FROM professor WHERE firstName='${req.body.firstName}' AND secondName='${req.body.secondName}'`,
                function (err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (typeof result[0] != 'undefined') {
                            res.status(200).send(JSON.stringify(result));
                        } else {
                            console.log(`Not found professors`);
                            res.status(404).send(JSON.stringify(`Not found professors`));
                        }
                    }
                }
            );
        } else {
            con.query(`SELECT * FROM professor WHERE firstName='${req.body.firstName}'`,
                function (err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (typeof result[0] != 'undefined') {
                            res.status(200).send(JSON.stringify(result));
                        } else {
                            console.log(`Not found professors`);
                            res.status(404).send(JSON.stringify(`Not found professors`));
                        }
                    }
                }
            );
        }
    } else {
        if (req.body.secondName !== "") {
            con.query(`SELECT * FROM professor WHERE secondName='${req.body.secondName}'`,
                function (err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (typeof result[0] != 'undefined') {
                            res.status(200).send(JSON.stringify(result));
                        } else {
                            console.log(`Not found professors`);
                            res.status(404).send(JSON.stringify(`Not found professors`));
                        }
                    }
                }
            );
        } else {
            res.status(404).send(JSON.stringify("Undefined firstName and secondName"));
            console.log("Undefined firstName and secondName");
        }
    }
});
app.listen(port, () => console.log(`Server has been started on port ${port}!`));