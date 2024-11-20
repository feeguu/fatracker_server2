const HttpError = require("../errors/HttpError");
const { Assignment } = require("../models/assignment");
const { Coordination } = require("../models/coordination");
const { Section } = require("../models/section");
const { StaffRole } = require("../models/staff-role");
const { StudentSection } = require("../models/student-section");
const { Teaching } = require("../models/teaching");

class AssignmentService {
  /**
   * @param {import("../services/section.service").SectionService} sectionService
   */
  constructor(sectionService) {
    this.sectionService = sectionService;
  }

  async create(user, { title, content, dueDate, sectionId }) {
    const { edit } = await this.sectionService.getUserPermissions(
      user,
      sectionId
    );

    if (!edit) {
      throw new HttpError(
        403,
        "You are not allowed to create assignment in this section"
      );
    }

    return await Assignment.create({
      title,
      content,
      dueDate,
      sectionId,
    });
  }

  async findById(user, id) {
    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: Section,
          as: "section",
          include: ["course"],
        },
      ],
    });

    if (!assignment) {
      throw new HttpError(404, "Assignment not found");
    }

    const { view } = await this.sectionService.getUserPermissions(
      user,
      assignment.sectionId
    );

    if (!view) {
      throw new HttpError(403, "You are not allowed to view this assignment");
    }

    return assignment;
  }

  async findAll(user) {
    if (user.roles.includes("STUDENT")) {
      return await Assignment.findAll({
        include: [
          {
            model: Section,
            as: "section",
            include: [
              {
                model: StudentSection,
                as: "studentSections",
                where: {
                  studentId: user.id,
                },
              },
            ],
          },
        ],
      });
    }

    if (user.roles.includes("ADMIN")) {
      return await Assignment.findAll({
        include: [{ model: Section, as: "section", include: ["course"] }],
      });
    }

    const sectionsId = []; // sections that staffs can view

    if (user.roles.includes("COORDINATOR")) {
      const coordinations = await Coordination.findAll({
        where: {
          coordinatorId: user.id,
        },
        include: [
          {
            model: Course,
            as: "course",
            include: [
              {
                model: Section,
                as: "sections",
              },
            ],
          },
        ],
      });

      for (const coordination of coordinations) {
        sectionsId.push(coordination.course.sectionId);
      }
    }

    if (user.roles.includes("PROFESSOR")) {
      const teachings = await Teaching.findAll({
        where: {
          "$staffRole.staffId$": user.id,
        },
        include: [
          {
            model: Section,
            as: "section",
            required: true,
          },
          {
            model: StaffRole,
            as: "staffRole",
            required: true,
          },
        ],
      });

      for (const teaching of teachings) {
        sectionsId.push(teaching.sectionId);
      }
    }

    return await Assignment.findAll({
      include: [
        {
          model: Section,
          as: "section",
          where: {
            id: sectionsId,
          },
        },
      ],
    });
  }

  async update(user, id, { title, content, dueDate }) {
    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: Section,
          as: "section",
        },
      ],
    });

    if (!assignment) {
      throw new HttpError(404, "Assignment not found");
    }

    const { edit } = await this.sectionService.getUserPermissions(
      user,
      assignment.sectionId
    );

    if (!edit) {
      throw new HttpError(403, "You are not allowed to update this assignment");
    }

    if (title) assignment.title = title;
    if (content) assignment.content = content;
    if (dueDate) assignment.dueDate = dueDate;

    return await assignment.save();
  }

  async delete(user, id) {
    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: Section,
          as: "section",
        },
      ],
    });

    if (!assignment) {
      throw new HttpError(404, "Assignment not found");
    }

    const { edit } = await this.sectionService.getUserPermissions(
      user,
      assignment.sectionId
    );

    if (!edit) {
      throw new HttpError(403, "You are not allowed to delete this assignment");
    }

    await assignment.destroy();
  }
}

module.exports = { AssignmentService };
