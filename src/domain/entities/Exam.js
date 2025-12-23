/**
 * Exam Domain Entity
 * Represents the core Exam business object
 */
class Exam {
  constructor({
    id,
    title,
    classId,
    duration,
    startAt,
    endAt,
    status,
    password,
    reviewMode,
    questions = [],
    creator,
    teacher
  }) {
    this.id = id;
    this.title = title;
    this.classId = classId;
    this.duration = duration;
    this.startAt = startAt ? new Date(startAt) : null;
    this.endAt = endAt ? new Date(endAt) : null;
    this.status = status;
    this.password = password;
    this.reviewMode = reviewMode;
    this.questions = questions;
    this.creator = creator;
    this.teacher = teacher;
  }

  /**
   * Calculate exam status based on current time
   * This is domain logic - belongs in the entity
   */
  calculateStatus() {
    if (!this.startAt || !this.endAt) {
      return this.status || 'SCHEDULED';
    }

    const now = new Date();
    const startTime = this.startAt;
    const endTime = this.endAt;

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return this.status || 'SCHEDULED';
    }

    if (now < startTime) {
      return 'SCHEDULED';
    } else if (now <= endTime) {
      return 'ONGOING';
    } else {
      return 'COMPLETED';
    }
  }

  /**
   * Check if exam is currently active
   */
  isActive() {
    return this.calculateStatus() === 'ONGOING';
  }

  /**
   * Check if exam is scheduled for future
   */
  isScheduled() {
    return this.calculateStatus() === 'SCHEDULED';
  }

  /**
   * Check if exam is completed
   */
  isCompleted() {
    return this.calculateStatus() === 'COMPLETED';
  }

  /**
   * Get remaining time in seconds
   */
  getRemainingTime() {
    if (!this.endAt) return null;
    const now = new Date();
    const endTime = this.endAt;
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    return remaining;
  }
}

export default Exam;

