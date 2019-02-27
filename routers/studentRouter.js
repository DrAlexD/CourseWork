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
                        res.end();
                    } else {
                        res.redirect('/students');
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

studentRouter.get('/:id/delete', (req, res) => {
    con.query(`DELETE FROM student WHERE studentId='${req.params.id}'`, err => {
        if (err) console.error(err);
        else res.end();
    });
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
                        res.end();
                    } else {
                        res.redirect('/students');
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

studentRouter.post('/:id/edit', (req, res) => {
    if (req.body.login !== "") {
        if (req.body.login === "admin") {
            res.status(500).send(JSON.stringify("Копия имеющегося админа"));
        } else {
            con.query("UPDATE student SET login" + `='${req.body.login}' WHERE studentId='${req.params.id}'`, err => {
                if (err) {
                    console.error(err);
                    res.status(500).send(JSON.stringify("Копия имеющегося студента"));
                }
            });
        }
    }
    if (req.body.firstName !== "") {
        con.query("UPDATE student SET firstName" + `='${req.body.firstName}' WHERE studentId='${req.params.id}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }
    if (req.body.secondName !== "") {
        con.query("UPDATE student SET secondName" + `='${req.body.secondName}' WHERE studentId='${req.params.id}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }
    if (req.body.studentGroup !== "") {
        con.query("UPDATE student SET `group`" + `='${req.body.studentGroup}' WHERE studentId='${req.params.id}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }
    if (req.body.password !== "") {
        con.query("UPDATE student SET password" + `='${req.body.password}' WHERE studentId='${req.params.id}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
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
                        res.end();
                    } else {
                        res.redirect('/students');
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

studentRouter.get('/:id/courseworks/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM coursework WHERE studentId='${req.params.id}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).send(JSON.stringify(result));
                        res.end();
                    } else {
                        res.status(404).send("Не найдены курсовые работы");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/add/coursework', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        res.sendFile(path.join(__filename, '../../pages/add_coursework_page.html'));
        res.end();
    } else {
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
                    res.status(500).send(JSON.stringify("Копия имеющейся курсовой работы"));
                } else {
                    con.query(`SELECT * FROM coursework WHERE title='${req.body.title}'`,
                        function (err2, result) {
                            if (err2)
                                console.error(err2);
                            else {
                                res.status(200).send(JSON.stringify(result[0].courseWorkId));
                                res.end();
                            }
                        }
                    );
                }
            }
        );
    } else {
        res.status(404).send(JSON.stringify("Не введены название, год, имя или фамилия руководителя"));
    }
});

studentRouter.get('/:id/coursework/:code', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM coursework WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/coursework_page.html'));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}`);
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

studentRouter.get('/:id/coursework/:code/delete', (req, res) => {
    con.query(`DELETE FROM coursework WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
        if (err) console.error(err);
        else res.end();
    });
});

studentRouter.get('/:id/coursework/:code/edit', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM coursework WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/coursework_edit_page.html'));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}`);
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

studentRouter.post('/:id/coursework/:code/edit', (req, res) => {
    if (req.body.title !== "") {
        con.query("UPDATE courseWork SET title" + `='${req.body.title}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
            if (err) {
                console.error(err);
                res.status(500).send(JSON.stringify("Копия имеющейся курсовой работы"));
            }
        });
    }
    if (req.body.year !== "") {
        con.query("UPDATE courseWork SET year" + `='${req.body.year}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }
    if (req.body.headFirstName !== "") {
        con.query("UPDATE courseWork SET headFirstName" + `='${req.body.headFirstName}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }
    if (req.body.headSecondName !== "") {
        con.query("UPDATE courseWork SET headSecondName" + `='${req.body.headSecondName}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
            if (err) console.error(err);
            else res.end();
        });
    }

    con.query("UPDATE courseWork SET taskText" + `='${req.body.taskText}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
        if (err) console.error(err);
        else res.end();
    });

    req.body.isConfirmedTaskText = (req.body.isConfirmedTaskText) ? 1 : 0;
    con.query("UPDATE courseWork SET isConfirmedTaskText" + `='${req.body.isConfirmedTaskText}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
        if (err) console.error(err);
        else res.end();
    });

    con.query("UPDATE courseWork SET currentNote" + `='${req.body.currentNote}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
        if (err) console.error(err);
        else res.end();
    });

    con.query("UPDATE courseWork SET linkToCode" + `='${req.body.linkToCode}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
        if (err) console.error(err);
        else res.end();
    });

    con.query("UPDATE courseWork SET presentation" + `='${req.body.presentation}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
        if (err) console.error(err);
        else res.end();
    });

    req.body.admittanceToProtection = (req.body.admittanceToProtection) ? 1 : 0;
    con.query("UPDATE courseWork SET admittanceToProtection" + `='${req.body.admittanceToProtection}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
        if (err) console.error(err);
        else res.end();
    });

    if (req.body.finalEvaluation === "") req.body.finalEvaluation = 0;
    con.query("UPDATE courseWork SET finalEvaluation" + `='${req.body.finalEvaluation}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`, err => {
        if (err) console.error(err);
        else res.end();
    });
});

studentRouter.get('/:id/coursework/:code/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM coursework WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.send(JSON.stringify(result[0]));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}`);
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

studentRouter.get('/:id/coursework/:code/consultations/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM consultation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).send(JSON.stringify(result));
                        res.end();
                    } else {
                        res.status(404).send("Не найдены консультации");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/coursework/:code/add/consultation', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        res.sendFile(path.join(__filename, '../../pages/add_consultation_page.html'));
        res.end();
    } else {
        res.redirect('/login');
        res.end();
    }
});

studentRouter.post('/:id/coursework/:code/add/consultation', (req, res) => {
    if (req.body.date !== "") {
        con.query("INSERT INTO consultation (`studentId`, `courseWorkId`, `date`) "
            + `VALUES ('${req.params.id}','${req.params.code}', '${req.body.date}')`,
            function (err) {
                if (err) {
                    console.error(err);
                } else {
                    res.end();
                }
            }
        );
    } else {
        res.status(404).send(JSON.stringify("Не введена дата"));
    }
});

studentRouter.get('/:id/coursework/:code/consultation/:date', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM consultation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/consultation_page.html'));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}/coursework/${req.params.code}`);
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

studentRouter.get('/:id/coursework/:code/consultation/:date/delete', (req, res) => {
    con.query(`DELETE FROM consultation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`, err => {
        if (err) console.error(err);
        else res.end();
    });
});

studentRouter.get('/:id/coursework/:code/consultation/:date/edit', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM consultation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/consultation_edit_page.html'));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}/coursework/${req.params.code}`);
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

studentRouter.post('/:id/coursework/:code/consultation/:date/edit', (req, res) => {
    con.query("UPDATE consultation SET topic" + `='${req.body.topic}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`, err => {
        if (err) console.error(err);
        else res.end();
    });
});

studentRouter.get('/:id/coursework/:code/consultation/:date/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM consultation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.send(JSON.stringify(result[0]));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}/coursework/${req.params.code}`);
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


studentRouter.get('/:id/coursework/:code/protections/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM protection WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).send(JSON.stringify(result));
                        res.end();
                    } else {
                        res.status(404).send("Не найдены защиты");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/coursework/:code/add/protection', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        res.sendFile(path.join(__filename, '../../pages/add_protection_page.html'));
        res.end();
    } else {
        res.redirect('/login');
        res.end();
    }
});

studentRouter.post('/:id/coursework/:code/add/protection', (req, res) => {
    if (req.body.date !== "") {
        req.body.isMainProtection = (req.body.isMainProtection) ? 1 : 0;
        con.query("INSERT INTO protection (`studentId`, `courseWorkId`, `date`, `isMainProtection`) "
            + `VALUES ('${req.params.id}','${req.params.code}', '${req.body.date}', '${req.body.isMainProtection}')`,
            function (err) {
                if (err) {
                    console.error(err);
                } else {
                    res.end();
                }
            }
        );
    } else {
        res.status(404).send(JSON.stringify("Не введена дата"));
    }
});

studentRouter.get('/:id/coursework/:code/protection/:date', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM protection WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/protection_page.html'));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}/coursework/${req.params.code}`);
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

studentRouter.get('/:id/coursework/:code/protection/:date/evaluations/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM protectionEvaluation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.status(200).send(JSON.stringify(result));
                        res.end();
                    } else {
                        res.status(404).send("Не найдены оценки");
                    }
                }
            }
        );
    } else {
        res.redirect('/login');
        res.end();
    }
});

studentRouter.get('/:id/coursework/:code/protection/:date/delete', (req, res) => {
    con.query(`DELETE FROM protection WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`, err => {
        if (err) console.error(err);
        else res.end();
    });
});

studentRouter.get('/:id/coursework/:code/protection/:date/edit', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM protection WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.sendFile(path.join(__filename, '../../pages/protection_edit_page.html'));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}/coursework/${req.params.code}`);
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

studentRouter.post('/:id/coursework/:code/protection/:date/edit', async (req, res) => {
    req.body.isMainProtection = (req.body.isMainProtection) ? 1 : 0;
    con.query("UPDATE protection SET isMainProtection" + `='${req.body.isMainProtection}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`, err => {
        if (err) console.error(err);
        else res.end();
    });

    if (req.body.evaluation === "") req.body.evaluation = 0;
    await new Promise((resolve) => {
        con.query(`SELECT * FROM protectionEvaluation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}' AND professorId='${req.session.username.userId}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        if (req.body.evaluation != 0) {
                            con.query("UPDATE protectionEvaluation SET evaluation" + `='${req.body.evaluation}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}' AND professorId='${req.session.username.userId}'`, err => {
                                if (err) console.error(err);
                                else {
                                    res.end();
                                    resolve("ok");
                                }
                            });
                        } else {
                            con.query(`DELETE FROM protectionEvaluation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}' AND professorId='${req.session.username.userId}'`, err => {
                                if (err) console.error(err);
                                else {
                                    res.end();
                                    resolve("ok");
                                }
                            });
                        }
                    } else {
                        if (req.body.evaluation != 0) {
                            con.query("INSERT INTO protectionEvaluation (`studentId`, `courseWorkId`, `date`, `professorId`, `evaluation`) " +
                                `VALUES ('${req.params.id}','${req.params.code}', '${req.params.date}', '${req.session.username.userId}','${req.body.evaluation}')`, err => {
                                if (err) console.error(err);
                                else {
                                    res.end();
                                    resolve("ok");
                                }
                            });
                        }
                    }
                }
            }
        );
    });

    con.query(`SELECT * FROM protectionEvaluation WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`,
        function (err, result) {
            if (err)
                console.error(err);
            else {
                if (typeof result[0] != 'undefined') {
                    let sum = 0;
                    for (let i = 0; i < result.length; i++) {
                        sum += result[i].evaluation;
                    }
                    let medEval = Math.round(sum / result.length);

                    con.query("UPDATE protection SET finalEvaluation" + `='${medEval}' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`, err => {
                        if (err) console.error(err);
                        else res.end();
                    });
                } else {
                    con.query("UPDATE protection SET finalEvaluation" + `='0' WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`, err => {
                        if (err) console.error(err);
                        else res.end();
                    });
                }
            }
        }
    );
});

studentRouter.get('/:id/coursework/:code/protection/:date/info.json', (req, res) => {
    if (typeof req.session.username != 'undefined') {
        con.query(`SELECT * FROM protection WHERE studentId='${req.params.id}' AND courseWorkId='${req.params.code}' AND date='${req.params.date}'`,
            function (err, result) {
                if (err)
                    console.error(err);
                else {
                    if (typeof result[0] != 'undefined') {
                        res.send(JSON.stringify(result[0]));
                        res.end();
                    } else {
                        res.redirect(`/student/${req.params.id}/coursework/${req.params.code}`);
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

module.exports = studentRouter;