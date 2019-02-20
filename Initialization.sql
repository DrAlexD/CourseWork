INSERT INTO courseworkdatabase.student (`firstName`, `secondName`, `group`, `login`, `password`)  VALUES ('Александр','Другаков','ИУ9-61','александрдругаков61','123456');
INSERT INTO courseworkdatabase.student (`firstName`, `secondName`, `group`, `login`, `password`)  VALUES ('Екатерина','Гимранова','ИУ9-61','екатеринагимранова61','123456');
INSERT INTO courseworkdatabase.student (`firstName`, `secondName`, `group`, `login`, `password`)  VALUES ('Тимур','Зиганшин','ИУ9-61','тимурзиганшин61','123456');
INSERT INTO courseworkdatabase.student (`firstName`, `secondName`, `group`, `login`, `password`)  VALUES ('Александр','Ивлев','ИУ9-61','александривлев61','123456');
INSERT INTO courseworkdatabase.student (`firstName`, `secondName`, `group`, `login`, `password`)  VALUES ('Даниил','Кудрявцев','ИУ9-61','даниилкудрявцев61','123456');

INSERT INTO courseworkdatabase.professor (`firstName`, `secondName`, `login`, `password`)   VALUES ('Александр','Дубанов','александрдубанов','123456');
INSERT INTO courseworkdatabase.professor (`firstName`, `secondName`, `login`, `password`)   VALUES ('Сергей','Скоробогатов','сергейскоробогатов','123456');

INSERT INTO courseworkdatabase.coursework (`studentId`, `title`, `year`, `headFirstName`, `headSecondName`)  VALUES ('1','CourseWorksApp','2019','Александр','Дубанов');

INSERT INTO courseworkdatabase.consultation (`studentId`, `courseWorkId`, `date`) VALUES ('1','1','2019-02-16');
INSERT INTO courseworkdatabase.consultation (`studentId`, `courseWorkId`, `date`) VALUES ('1','1','2019-02-20');