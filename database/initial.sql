
CREATE
DATABASE exam_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use exam_online;

CREATE TABLE `user`
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50) UNIQUE  NOT NULL,
    password_hash VARCHAR(60)         NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    first_name    VARCHAR(50)         NOT NULL,
    last_name     VARCHAR(50)         NOT NULL,
    image         VARCHAR(255),
    create_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    two_factor   BOOLEAN DEFAULT FALSE,
    role 	  ENUM('ROLE_ADMIN', 'ROLE_LECTURER', 'ROLE_STUDENT') NOT NULL
);

CREATE TABLE login_history
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id    BIGINT                              NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_agent VARCHAR(255)                         NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE class
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    create_by     BIGINT       NOT NULL,
    create_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image       VARCHAR(255),
    FOREIGN KEY (create_by) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE student_class
(
	id		 VARCHAR(20) NOT NULL,
    user_id  BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES class (id) ON DELETE CASCADE
);

CREATE TABLE exam
(
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id  BIGINT       NOT NULL,
    user_id   BIGINT       NOT NULL,
    title     VARCHAR(255) NOT NULL,
    duration  INT          NOT NULL,
    start_at  DATETIME     NOT NULL,
    end_at    DATETIME     NOT NULL,
    password  VARCHAR(10),
    status    ENUM('PENDING', 'ONGOING', 'COMPLETED', 'CANCELED') NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by BIGINT,
    FOREIGN KEY (class_id) REFERENCES class (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (update_by) REFERENCES user (id) ON DELETE SET NULL
);

CREATE TABLE student_exam
(
    id        VARCHAR(20) PRIMARY KEY,
    exam_id   BIGINT      NOT NULL,
    user_id   BIGINT      NOT NULL,
    score     DECIMAL(5, 2) DEFAULT NULL,
    start_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finish_at TIMESTAMP DEFAULT NULL,
    time      INT           DEFAULT NULL,
    status    ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED') NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exam (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE question
(
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id   BIGINT          NOT NULL,
    user_id   BIGINT          NOT NULL,
    title     VARCHAR(255) NOT NULL,
    type      ENUM('ESSAY', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE') NOT NULL,
    choices    TEXT,
    answer    TEXT         NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by BIGINT,
    FOREIGN KEY (exam_id) REFERENCES exam (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (update_by) REFERENCES user (id) ON DELETE SET NULL
);

CREATE TABLE exam_submission
(
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_exam_id VARCHAR(20) NOT NULL,
    question_id     BIGINT         NOT NULL,
    answer          TEXT        NOT NULL,
    is_correct      BOOLEAN     NOT NULL DEFAULT FALSE,
    FOREIGN KEY (student_exam_id) REFERENCES student_exam (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
);