const path = require('path');
const express = require('express');
const mysql = require('mysql');

const studentRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "123456",
    database: "CourseWorkDatabase"
});

con.connect(err => err ? console.error(err) : console.log("StudentRouter connected to MySQL database!"));

studentRouter.get('/:id', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM student WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/student_page.html'));
                        console.log(`Student page, student: ${result[0].login}`);
                    } else {
                        console.log(`Not found student`);
                        res.redirect('/students');
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

studentRouter.get('/:id/edit', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM student WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/student_edit_page.html'));
                        console.log(`Student_edit page, student: ${result[0].login}`);
                    } else {
                        console.log(`Not found student`);
                        res.redirect('/students');
                        res.end();
                    }
                }
            });
    } else {
        console.log(`Student_edit page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/info.json', (req, res) => {
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
                        res.redirect('/students');
                        res.end();
                    }
                }
            });
    } else {
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/courseworks/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM coursework WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).send(JSON.stringify(result));
                    } else {
                        res.status(404).send("Not found courseWorks");
                    }
                }
            });
    } else {
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/add/coursework', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        console.log(`AddCourseWork page, user: ${req.session.username}`);
        res.sendFile(path.join(__filename, '../../pages/add_coursework_page.html'));
    } else {
        console.log(`AddCourseWork page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

studentRouter.post('/:id/add/coursework', (req, res) => {
    if (req.body.title !== "" && req.body.year !== "" && req.body.headFirstName !== "" && req.body.headSecondName !== "") {
        con.query("INSERT INTO coursework (`studentId`, `title`, `year`, `headFirstName`, `headSecondName`) "
            + `VALUES ('${req.params.id}','${req.body.title}', '${req.body.year}', '${req.body.headFirstName}', '${req.body.headSecondName}')`,
            function (err1) {
                if (err1) {
                    console.error(err1);
                    res.status(500).send(JSON.stringify("Copy of existing courseWork"));
                } else {
                    con.query(`SELECT * FROM coursework WHERE title='${req.body.title}'`,
                        function (err2, result) {
                            if (err2)
                                console.error(err2);
                            else {
                                console.log(`Success added courseWork: ${result[0].title}`);
                                res.status(200).send(JSON.stringify(result[0].courseWorkId));
                                res.end();
                            }
                        });
                }
            }
        );
    } else {
        res.status(404).send(JSON.stringify("Undefined title or year or headFirstName or headSecondName"));
        console.log("Undefined title or year or headFirstName or headSecondName");
    }
});

studentRouter.get('/:id/coursework/:code', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM coursework WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        let i = 0;
                        for (; i < result.length; i++) {
                            if (result[i].courseWorkId == req.params.code) {
                                console.log(`CourseWork page, courseWork: ${result[i].title}`);
                                res.sendFile(path.join(__filename, '../../pages/coursework_page.html'));
                                break;
                            }
                        }
                        if (i === result.length) {
                            console.log(`Not found courseWork`);
                            res.redirect(`/student/${req.params.id}`);
                            res.end();
                        }
                    } else {
                        console.log(`Not found courseWorks`);
                        res.redirect(`/student/${req.params.id}`);
                        res.end();
                    }
                }
            });
    } else {
        console.log(`CourseWork page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/coursework/:code/edit', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM coursework WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        let i = 0;
                        for (; i < result.length; i++) {
                            if (result[i].courseWorkId == req.params.code) {
                                console.log(`CourseWork_edit page, courseWork: ${result[i].title}`);
                                res.sendFile(path.join(__filename, '../../pages/coursework_edit_page.html'));
                                break;
                            }
                        }
                        if (i === result.length) {
                            console.log(`Not found courseWork`);
                            res.redirect(`/student/${req.params.id}`);
                            res.end();
                        }
                    } else {
                        console.log(`Not found courseWorks`);
                        res.redirect(`/student/${req.params.id}`);
                        res.end();
                    }
                }
            });
    } else {
        console.log(`CourseWork_edit page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/coursework/:code/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM coursework WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        let i = 0;
                        for (; i < result.length; i++) {
                            if (result[i].courseWorkId == req.params.code) {
                                res.send(JSON.stringify(result[i]));
                                break;
                            }
                        }
                        if (i === result.length) {
                            console.log(`Not found courseWork`);
                            res.redirect(`/student/${req.params.id}`);
                            res.end();
                        }
                    } else {
                        console.log(`Not found courseWorks`);
                        res.redirect(`/student/${req.params.id}`);
                        res.end();
                    }
                }
            });
    } else {
        console.log(`CourseWork page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

module.exports = studentRouter;