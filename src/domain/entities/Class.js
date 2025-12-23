/**
 * Class Domain Entity
 * Represents the core Class business object
 */
class Class {
  constructor({
    id,
    name,
    description,
    teacherId,
    studentCount = 0,
    examCount = 0
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.teacherId = teacherId;
    this.studentCount = studentCount;
    this.examCount = examCount;
  }
}

export default Class;

