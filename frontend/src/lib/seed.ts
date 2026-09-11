import connectToDatabase from "./db";
import { User, Announcement, Event, Project, Issue, Registration, Category } from "@/models";
import {
  sampleUsers,
  sampleAnnouncements,
  sampleEvents,
  sampleProjects,
  sampleIssues,
} from "./seedData";

/**
 * Seeds the MongoDB database with initial sample records for testing and demonstration.
 */
export async function seedDatabase() {
  await connectToDatabase();

  console.log("🌱 [Seed] Checking and seeding MongoDB collections...");

  // 1. Seed Users
  let usersCount = await User.countDocuments();
  if (usersCount === 0) {
    await User.insertMany(sampleUsers);
    console.log("✅ Seeded Users collection");
  }

  // 2. Seed Announcements
  let announcementsCount = await Announcement.countDocuments();
  if (announcementsCount === 0) {
    await Announcement.insertMany(sampleAnnouncements);
    console.log("✅ Seeded Announcements collection");
  }

  // 3. Seed Events
  let eventsCount = await Event.countDocuments();
  if (eventsCount === 0) {
    const insertedEvents = await Event.insertMany(sampleEvents);
    console.log("✅ Seeded Events collection");

    // 4. Seed sample registration for first event and student
    const student = await User.findOne({ role: "student" });
    if (student && insertedEvents.length > 0) {
      await Registration.create({
        eventId: insertedEvents[0]._id,
        eventTitle: insertedEvents[0].title,
        studentName: student.name,
        studentEmail: student.email,
        studentId: student.studentId || "2024BCSE042",
        department: student.department || "Computer Science",
        status: "confirmed",
      });
      console.log("✅ Seeded sample Event Registration");
    }
  }

  // 5. Seed Projects
  let projectsCount = await Project.countDocuments();
  if (projectsCount === 0) {
    await Project.insertMany(sampleProjects);
    console.log("✅ Seeded Projects collection");
  }

  // 6. Seed Issues
  let issuesCount = await Issue.countDocuments();
  if (issuesCount === 0) {
    await Issue.insertMany(sampleIssues);
    console.log("✅ Seeded Issues collection");
  }

  return {
    success: true,
    message: "Database seeded successfully",
    counts: {
      users: await User.countDocuments(),
      announcements: await Announcement.countDocuments(),
      events: await Event.countDocuments(),
      projects: await Project.countDocuments(),
      issues: await Issue.countDocuments(),
      registrations: await Registration.countDocuments(),
    },
  };
}

export default seedDatabase;
