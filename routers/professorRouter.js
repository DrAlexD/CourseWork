const path = require('path');
const express = require('express');
const mysql = require('mysql');

const professorRouter = express.Router();

const con = mysql.createConnection({
    user: "root",
    password: "123456",
    database: "CourseWorkDatabase"
});

con.connect(err => err ? console.error(err) : console.log("ProfessorRouter connected to MySQL database!\n"));

professorRouter.get('/:id', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM professor WHERE professorId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/professor_page.html'));
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

professorRouter.get('/:id/delete', (req, res) => {
    console.log(`Success deleted professor`);
    con.query(`DELETE FROM professor WHERE professorId='${req.params.id}'`, err => {
        if (err) console.error(err);
        else res.end();
    });
});

professorRouter.get('/:id/edit', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM professor WHERE professorId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/professor_edit_page.html'));
                        console.log(`Professor_edit page, professor: ${result[0].login}`);
                    } else {
                        console.log(`Not found professor`);
                        res.redirect('/professors');
                        res.end();
                    }
                }
            });
    } else {
        console.log(`Professor_edit page, session is ${req.session.username}`);
        res.redirect('/login');
        res.end();
    }
});

professorRouter.post('/:id/edit', (req, res) => {
    console.log(`Success edited professor: ${req.body.login}`);
    if (req.body.login !== "") {
        con.query("UPDATE professor SET login" + `='${req.body.login}' WHERE professorId='${req.params.id}'`, err => {
            if (err) {
                console.error(err);
                res.status(500).send(JSON.stringify("Copy of existing professor"));
            }
        });
    }
    if (req.body.firstName !== "") {
        con.query("UPDATE professor SET firstName" + `='${req.body.firstName}' WHERE professorId='${req.params.id}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }
    if (req.body.secondName !== "") {
        con.query("UPDATE professor SET secondName" + `='${req.body.secondName}' WHERE professorId='${req.params.id}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }
    if (req.body.password !== "") {
        con.query("UPDATE professor SET password" + `='${req.body.password}' WHERE professorId='${req.params.id}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }
});

professorRouter.get('/:id/info.json', (req, res) => {
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

professorRouter.get('/:id/courseworks/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM professor WHERE professorId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        con.query(`SELECT * FROM coursework WHERE headFirstName='${result[0].firstName}' AND headSecondName='${result[0].secondName}'`,
                            function (err2, result2) {
                                if (err2)
                                    console.error(err2);
                                else {
                                    if (typeof result2[0] != 'undefined') {
                                        res.status(200).send(JSON.stringify(result2));
                                    } else {
                                        res.status(404).send("Not found courseWorks");
                                    }
                                }
                            });
                    } else {
                        res.status(404).send("Not found professor");
                    }
                }
            });
    } else {
        res.redirect('/login');
        res.end();
    }
});

module.exports = professorRouter;