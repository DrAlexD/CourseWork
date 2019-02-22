const path = require('path');
const express = require('express');
const mysql = require('mysql');

const actionsRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "123456",
    database: "CourseWorkDatabase"
});

con.connect(err => err ? console.error(err) : console.log("ActionsRouter connected to MySQL database!"));

actionsRouter.get('/', (req, res) => {
    res.redirect('/login');
    res.end();
});

actionsRouter.get('/login', (req, res) => {
    if (typeof req.session.username == 'undefined')
        res.sendFile(path.join(__filename, '../../pages/log_in_page.html'));
    else {
        res.redirect('/actions');
        res.end();
    }
});

actionsRouter.post('/login', (req, res) => {
    if (req.body.username !== "" && req.body.password !== "") {
        if (req.body.username === "admin") {
            if (req.body.password === "admin") {
                req.session.username = "admin";
                console.log(`Success log in: ${req.session.username}`);
                res.end();
            } else {
                res.status(404).send(JSON.stringify("Wrong password for user: admin"));
            }
        } else {
            con.query(`SELECT * FROM student WHERE login='${req.body.username}' AND password='${req.body.password}'`,
                function (err, result) {
                    if (err)
                        console.error(err);
                    else {
                        if (typeof result[0] != 'undefined') {
                            req.session.username = req.body.username;
                            console.log(`Success log in: ${req.session.username}`);
                            res.end();
                        } else {
                            con.query(`SELECT * FROM professor WHERE login='${req.body.username}' AND password='${req.body.password}'`,
                                function (err, result) {
                                    if (err)
                                        console.error(err);
                                    else {
                                        if (typeof result[0] != 'undefined') {
                                            req.session.username = req.body.username;
                                            console.log(`Success log in: ${req.session.username}`);
                                            res.end();
                                        } else {
                                            res.status(404).send(JSON.stringify("Wrong login or password"));
                                        }
                                    }
                                }
                            );
                        }
                    }
                }
            );
        }
    } else {
        res.status(404).send(JSON.stringify("Undefined login or password"));
    }
});

actionsRouter.get('/actions', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        if (req.session.username === "admin") {
            res.sendFile(path.join(__filename, '../../pages/actions_page.html'));
        } else {
            con.query(`SELECT * FROM student WHERE login='${req.session.username}'`,
                function (err, result) {
                    if (err)
                        console.error(err);
                    else {
                        if (typeof result[0] != 'undefined') {
                            res.redirect(`/student/${result[0].studentId}`);
                            res.end();
                        } else {
                            con.query(`SELECT * FROM professor WHERE login='${req.session.username}'`,
                                function (err, result) {
                                    if (err)
                                        console.error(err);
                                    else {
                                        if (typeof result[0] != 'undefined') {
                                            res.redirect(`/professor/${result[0].professorId}`);
                                            res.end();
                                        }
                                    }
                                }
                            )
                        }
                    }
                }
            );
        }
    } else {
        res.redirect('/login');
        res.end();
    }
});

actionsRouter.get('/add/student', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        if (req.session.username !== "admin") {
            res.redirect('/actions');
            res.end();
        } else
            res.sendFile(path.join(__filename, '../../pages/add_student_page.html'));
    } else {
        res.redirect('/login');
        res.end();
    }
});

actionsRouter.post('/add/student', (req, res) => {
    if (req.body.firstName !== "" && req.body.secondName !== "" && req.body.studentGroup !== "") {
        let log = `${req.body.firstName} ${req.body.secondName}`.replace(" ", "").toLowerCase();
        log += (req.body.studentGroup).slice(-2);
        let pas = `123456`;
        if (log !== "admin") {
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
                            }
                        );
                    }
                }
            );
        } else {
            res.status(500).send(JSON.stringify("Copy of existing admin"));
        }
    } else {
        res.status(404).send(JSON.stringify("Undefined firstName or secondName or group"));
    }
});

actionsRouter.get('/students', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        if (req.session.username !== "admin") {
            res.redirect('/actions');
            res.end();
        } else
            res.sendFile(path.join(__filename, '../../pages/students_page.html'));
    } else {
        res.redirect('/login');
        res.end();
    }
});

actionsRouter.get('/students/all.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        if (req.session.username !== "admin") {
            res.redirect('/actions');
            res.end();
        } else {
            con.query(`SELECT * FROM student`,
                function (err, result) {
                    if (err)
                        console.error(err);
                    else {
                        if (typeof result[0] != 'undefined') {
                            res.status(200).send(JSON.stringify(result));
                        } else {
                            res.status(404).send(JSON.stringify(`Not found students`));
                        }
                    }
                }
            );
        }
    } else {
        res.redirect('/login');
        res.end();
    }
});

actionsRouter.post('/students', (req, res) => {
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
                                res.status(404).send(JSON.stringify(`Not found students`));
                            }
                        }
                    }
                );
            } else {
                res.status(404).send(JSON.stringify("Undefined firstName and secondName and group"));
            }
        }
    }
});

actionsRouter.get('/add/professor', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        if (req.session.username !== "admin") {
            res.redirect('/actions');
            res.end();
        } else
            res.sendFile(path.join(__filename, '../../pages/add_professor_page.html'));
    } else {
        res.redirect('/login');
        res.end();
    }
});

actionsRouter.post('/add/professor', (req, res) => {
    if (req.body.firstName !== "" && req.body.secondName !== "") {
        let log = `${req.body.firstName} ${req.body.secondName}`.replace(" ", "").toLowerCase();
        let pas = `123456`;
        if (log !== "admin") {
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
                            }
                        );
                    }
                }
            );
        } else {
            res.status(500).send(JSON.stringify("Copy of existing admin"));
        }
    } else {
        res.status(404).send(JSON.stringify("Undefined firstName or secondName"));
    }
});

actionsRouter.get('/professors', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        if (req.session.username !== "admin") {
            res.redirect('/actions');
            res.end();
        } else
            res.sendFile(path.join(__filename, '../../pages/professors_page.html'));
    } else {
        res.redirect('/login');
        res.end();
    }
});

actionsRouter.get('/professors/all.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        if (req.session.username !== "admin") {
            res.redirect('/actions');
            res.end();
        } else {
            con.query(`SELECT * FROM professor`,
                function (err, result) {
                    if (err)
                        console.error(err);
                    else {
                        if (typeof result[0] != 'undefined') {
                            res.status(200).send(JSON.stringify(result));
                        } else {
                            res.status(404).send(JSON.stringify(`Not found professors`));
                        }
                    }
                }
            );
        }
    } else {
        res.redirect('/login');
        res.end();
    }
});

actionsRouter.post('/professors', (req, res) => {
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
                            res.status(404).send(JSON.stringify(`Not found professors`));
                        }
                    }
                }
            );
        } else {
            res.status(404).send(JSON.stringify("Undefined firstName and secondName"));
        }
    }
});

module.exports = actionsRouter;