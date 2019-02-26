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
                        res.end();
                    } else {
                        res.redirect('/actions');
                        res.end();
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
        res.end();
    }
});

professorRouter.get('/:id/delete', (req, res) => {
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
                        res.end();
                    } else {
                        res.redirect('/professors');
                        res.end();
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
        res.end();
    }
});

professorRouter.post('/:id/edit', (req, res) => {
    if (req.body.login !== "") {
        if (req.body.login === "admin") {
            res.status(500).send(JSON.stringify("Копия имеющегося админа"));
        } else {
            con.query("UPDATE professor SET login" + `='${req.body.login}' WHERE professorId='${req.params.id}'`, err => {
                if (err) {
                    console.error(err);
                    res.status(500).send(JSON.stringify("Копия имеющегося профессора"));
                }
            });
        }
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
                        res.end();
                    } else {
                        res.redirect('/actions');
                        res.end();
                    }
                }
            }
        );
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
                                        res.end();
                                    } else {
                                        res.status(404).send("Не найдены курсовые работы");
                                    }
                                }
                            }
                        );
                    } else {
                        res.status(404).send("Не найден профессор");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
        res.end();
    }
});

module.exports = professorRouter;