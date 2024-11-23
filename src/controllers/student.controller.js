const joi = require("joi");
const HttpError = require("../errors/HttpError");

class StudentController {
  /**
   *
   * @param {import("../services/student.service").StudentService} studentService
   */
  constructor(studentService) {
    this.studentService = studentService;
  }

  async getStudent(req, res) {
    const ra = req.params.ra;
    const student = await this.studentService.findByRa(ra);
    if (!student) {
      throw new HttpError(404, "Student not found");
    }
    return res.status(200).json(student);
  }

  async getStudents(req, res) {
    const querySchema = joi
      .object({
        offset: joi.number().integer().min(0).default(0),
        limit: joi.number().integer().min(1),
        sectionId: joi.number().integer(),
        courseCode: joi.string().trim(),
      })
      .nand("sectionId", "courseCode")
      .messages({
        "object.nand": "sectionId and courseCode cannot be used together",
      });

    const { error, value } = querySchema.validate(req.query, {
      allowUnknown: true,
      abortEarly: false,
    });

    if (error) {
      throw new HttpError(400, error.details.map((d) => d.message).join(", "));
    }

    const students = await this.studentService.findAll(value);

    return res.status(200).json(students);
  }

  async findOrCreateStudent(req, res) {
    const bodySchema = joi.object({
      ra: joi.string().trim().required(),
      name: joi.string().trim().required(),
    });

    const { error, value } = bodySchema.validate(req.body, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HttpError(400, error.details.map((d) => d.message).join(", "));
    }

    const { created, student } = await this.studentService.findOrCreate(value);

    return res.status(created ? 201 : 200).json(student);
  }

  async updateStudent(req, res) {
    const ra = req.params.ra;

    if (res.locals.type === "STUDENT" && res.locals.user.ra !== ra) {
      throw new HttpError(403, "Forbidden");
    }

    const bodySchema = joi.object({
      name: joi.string().trim(),
      email: joi.string().email(),
    });

    const { error, value } = bodySchema.validate(req.body, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HttpError(400, error.details.map((d) => d.message).join(", "));
    }

    const student = await this.studentService.update(ra, value);

    return res.status(200).json(student);
  }

  async deleteStudent(req, res) {
    const ra = req.params.ra;

    await this.studentService.delete(ra);

    return res.status(204).end();
  }

  async addStudentToSection(req, res) {
    const ra = req.params.ra;

    const bodySchema = joi.object({
      sectionId: joi.number().integer().required(),
    });

    const { error, value } = bodySchema.validate(req.body, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HttpError(400, error.details.map((d) => d.message).join(", "));
    }

    const student = await this.studentService.addToSection(ra, value.sectionId);
    return res.status(200).json(student);
  }

  async removeStudentFromSection(req, res) {
    const ra = req.params.ra;
    const sectionId = req.params.sectionId;

    await this.studentService.removeFromSection(ra, sectionId);

    return res.status(204).end();
  }

  async getStudentSections(req, res) {
    const ra = req.params.ra;

    if (res.locals.type === "STUDENT" && res.locals.user.ra !== ra) {
      throw new HttpError(403, "Forbidden");
    }

    const sections = await this.studentService.getSections(ra);

    return res.status(200).json(sections);
  }
}

module.exports = { StudentController };
