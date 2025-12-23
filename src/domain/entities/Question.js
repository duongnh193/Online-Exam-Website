/**
 * Question Domain Entity
 * Represents the core Question business object
 */
class Question {
  constructor({
    id,
    examId,
    title,
    type,
    choices = [],
    answer,
    image,
    creatorId
  }) {
    this.id = id;
    this.examId = examId;
    this.title = title;
    this.type = type; // ESSAY, SINGLE_CHOICE, MULTIPLE_CHOICE
    this.choices = choices;
    this.answer = answer;
    this.image = image;
    this.creatorId = creatorId;
  }

  isEssay() {
    return this.type === 'ESSAY';
  }

  isSingleChoice() {
    return this.type === 'SINGLE_CHOICE';
  }

  isMultipleChoice() {
    return this.type === 'MULTIPLE_CHOICE';
  }

  requiresChoices() {
    return this.isSingleChoice() || this.isMultipleChoice();
  }

  validate() {
    if (!this.title || !this.type) {
      return { valid: false, error: 'Title and type are required' };
    }

    if (!['ESSAY', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(this.type)) {
      return { valid: false, error: 'Invalid question type' };
    }

    if (this.requiresChoices() && (!this.choices || this.choices.length === 0)) {
      return { valid: false, error: 'Choices are required for choice-type questions' };
    }

    return { valid: true };
  }
}

export default Question;

