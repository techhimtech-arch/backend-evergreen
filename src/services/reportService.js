const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const School = require('../models/School');
const Class = require('../models/Class');
const Section = require('../models/Section');
const AcademicYear = require('../models/AcademicYear');
const logger = require('../utils/logger');

class ReportService {
  /**
   * Generate PDF report card for a student
   */
  async generateReportCard(studentId, examId, schoolId) {
    // Fetch all required data
    const [student, exam, school, results] = await Promise.all([
      Student.findOne({ _id: studentId, schoolId })
        .populate('classId', 'name')
        .populate('sectionId', 'name'),
      Exam.findOne({ _id: examId, schoolId }),
      School.findById(schoolId),
      Result.find({ studentId, examId, schoolId })
        .populate('subjectId', 'name'),
    ]);

    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    if (!exam) {
      throw { status: 404, message: 'Exam not found' };
    }

    if (results.length === 0) {
      throw { status: 404, message: 'No results found for this student and exam' };
    }

    // Get academic year
    const academicYear = await AcademicYear.getCurrentYear(schoolId);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Buffer to store PDF
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Generate PDF content
    this._generateHeader(doc, school, academicYear);
    this._generateStudentInfo(doc, student, exam);
    this._generateResultsTable(doc, results);
    this._generateSummary(doc, results);
    this._generateFooter(doc, school);

    // Finalize PDF
    doc.end();

    // Return promise that resolves with buffer
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve({
          buffer: pdfBuffer,
          filename: `ReportCard_${student.admissionNumber}_${exam.name.replace(/\s+/g, '_')}.pdf`,
        });
      });
      doc.on('error', reject);
    });
  }

  /**
   * Generate bulk report cards for a class
   */
  async generateBulkReportCards(classId, sectionId, examId, schoolId) {
    const students = await Student.find({
      classId,
      sectionId,
      schoolId,
      isActive: true,
    }).select('_id');

    const reports = [];
    const errors = [];

    for (const student of students) {
      try {
        const report = await this.generateReportCard(student._id, examId, schoolId);
        reports.push(report);
      } catch (error) {
        errors.push({
          studentId: student._id,
          error: error.message,
        });
        logger.error('Failed to generate report card', {
          studentId: student._id,
          error: error.message,
        });
      }
    }

    return { reports, errors };
  }

  /**
   * Generate header with school info
   */
  _generateHeader(doc, school, academicYear) {
    // School name
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(school.name, { align: 'center' });

    // School address
    if (school.address) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(school.address, { align: 'center' });
    }

    // School contact
    if (school.phone || school.email) {
      const contact = [school.phone, school.email].filter(Boolean).join(' | ');
      doc.text(contact, { align: 'center' });
    }

    doc.moveDown();

    // Title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('REPORT CARD', { align: 'center' });

    // Academic year
    if (academicYear) {
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Academic Year: ${academicYear.name}`, { align: 'center' });
    }

    doc.moveDown();

    // Horizontal line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown();
  }

  /**
   * Generate student information section
   */
  _generateStudentInfo(doc, student, exam) {
    const leftCol = 50;
    const rightCol = 300;
    const startY = doc.y;

    doc.fontSize(11).font('Helvetica');

    // Left column
    doc.text(`Student Name: ${student.firstName} ${student.lastName}`, leftCol, startY);
    doc.text(`Admission No: ${student.admissionNumber}`, leftCol);
    doc.text(`Class: ${student.classId?.name || 'N/A'}`, leftCol);

    // Right column
    doc.text(`Roll No: ${student.rollNumber || 'N/A'}`, rightCol, startY);
    doc.text(`Section: ${student.sectionId?.name || 'N/A'}`, rightCol);
    doc.text(`Exam: ${exam.name}`, rightCol);

    // Date of Birth if available
    if (student.dateOfBirth) {
      doc.text(`Date of Birth: ${new Date(student.dateOfBirth).toLocaleDateString()}`, leftCol);
    }

    // Exam date if available
    if (exam.examDate) {
      doc.text(`Exam Date: ${new Date(exam.examDate).toLocaleDateString()}`, rightCol);
    }

    doc.moveDown(2);

    // Horizontal line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown();
  }

  /**
   * Generate results table
   */
  _generateResultsTable(doc, results) {
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = {
      sno: 40,
      subject: 180,
      maxMarks: 80,
      obtained: 80,
      percentage: 70,
      grade: 45,
    };

    // Table header
    doc
      .fontSize(11)
      .font('Helvetica-Bold');

    let xPos = tableLeft;
    doc.text('S.No', xPos, tableTop, { width: colWidths.sno, align: 'center' });
    xPos += colWidths.sno;
    doc.text('Subject', xPos, tableTop, { width: colWidths.subject, align: 'left' });
    xPos += colWidths.subject;
    doc.text('Max Marks', xPos, tableTop, { width: colWidths.maxMarks, align: 'center' });
    xPos += colWidths.maxMarks;
    doc.text('Obtained', xPos, tableTop, { width: colWidths.obtained, align: 'center' });
    xPos += colWidths.obtained;
    doc.text('%', xPos, tableTop, { width: colWidths.percentage, align: 'center' });
    xPos += colWidths.percentage;
    doc.text('Grade', xPos, tableTop, { width: colWidths.grade, align: 'center' });

    // Header line
    doc.moveDown();
    doc
      .moveTo(tableLeft, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Table rows
    doc.font('Helvetica').fontSize(10);

    results.forEach((result, index) => {
      const rowY = doc.y;
      xPos = tableLeft;

      const percentage = ((result.marksObtained / result.maxMarks) * 100).toFixed(1);
      const grade = result.grade || this._calculateGrade(percentage);

      doc.text(String(index + 1), xPos, rowY, { width: colWidths.sno, align: 'center' });
      xPos += colWidths.sno;
      doc.text(result.subjectId?.name || 'Unknown', xPos, rowY, { width: colWidths.subject, align: 'left' });
      xPos += colWidths.subject;
      doc.text(String(result.maxMarks), xPos, rowY, { width: colWidths.maxMarks, align: 'center' });
      xPos += colWidths.maxMarks;
      doc.text(String(result.marksObtained), xPos, rowY, { width: colWidths.obtained, align: 'center' });
      xPos += colWidths.obtained;
      doc.text(percentage, xPos, rowY, { width: colWidths.percentage, align: 'center' });
      xPos += colWidths.percentage;
      doc.text(grade, xPos, rowY, { width: colWidths.grade, align: 'center' });

      doc.moveDown();
    });

    // Bottom line
    doc
      .moveTo(tableLeft, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown();
  }

  /**
   * Generate summary section
   */
  _generateSummary(doc, results) {
    const totalMax = results.reduce((sum, r) => sum + r.maxMarks, 0);
    const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const overallPercentage = ((totalObtained / totalMax) * 100).toFixed(2);
    const overallGrade = this._calculateGrade(overallPercentage);

    doc.fontSize(11).font('Helvetica-Bold');

    const summaryY = doc.y;
    doc.text(`Total Marks: ${totalObtained} / ${totalMax}`, 50, summaryY);
    doc.text(`Overall Percentage: ${overallPercentage}%`, 250, summaryY);
    doc.text(`Grade: ${overallGrade}`, 450, summaryY);

    doc.moveDown(2);

    // Result declaration
    const isPassed = parseFloat(overallPercentage) >= 33;
    doc
      .fontSize(14)
      .text(isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT', { align: 'center' })
      .fillColor(isPassed ? 'green' : 'red');

    doc.fillColor('black');
    doc.moveDown(2);

    // Remarks section
    doc.fontSize(10).font('Helvetica');
    doc.text('Remarks: _______________________________________________', 50);
    doc.moveDown(2);

    // Signatures
    const sigY = doc.y + 30;
    doc.text("Class Teacher's Signature", 50, sigY);
    doc.text("Principal's Signature", 350, sigY);
    doc.text('_____________________', 50, sigY + 15);
    doc.text('_____________________', 350, sigY + 15);
  }

  /**
   * Generate footer
   */
  _generateFooter(doc, school) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 80;

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('gray');

    // Horizontal line
    doc
      .moveTo(50, footerY - 10)
      .lineTo(545, footerY - 10)
      .stroke();

    doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, footerY);
    doc.text(`${school.name} - Report Card`, { align: 'center' });
    doc.text('This is a computer-generated document.', 50, footerY + 15, { align: 'center' });

    doc.fillColor('black');
  }

  /**
   * Calculate grade based on percentage
   */
  _calculateGrade(percentage) {
    const pct = parseFloat(percentage);
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C+';
    if (pct >= 40) return 'C';
    if (pct >= 33) return 'D';
    return 'F';
  }

  /**
   * Generate attendance report
   */
  async generateAttendanceReport(studentId, startDate, endDate, schoolId) {
    const Attendance = require('../models/Attendance');
    
    const [student, attendanceRecords] = await Promise.all([
      Student.findOne({ _id: studentId, schoolId })
        .populate('classId', 'name')
        .populate('sectionId', 'name'),
      Attendance.find({
        studentId,
        schoolId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      }).sort({ date: 1 }),
    ]);

    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    const school = await School.findById(schoolId);

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(school.name, { align: 'center' });

    doc.moveDown();

    doc
      .fontSize(16)
      .text('ATTENDANCE REPORT', { align: 'center' });

    doc.moveDown();

    // Student info
    doc.fontSize(11).font('Helvetica');
    doc.text(`Student: ${student.firstName} ${student.lastName}`);
    doc.text(`Class: ${student.classId?.name} | Section: ${student.sectionId?.name}`);
    doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);

    doc.moveDown();

    // Summary
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((r) => r.status === 'Present').length;
    const absentDays = attendanceRecords.filter((r) => r.status === 'Absent').length;
    const lateDays = attendanceRecords.filter((r) => r.status === 'Late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    doc.font('Helvetica-Bold');
    doc.text(`Total Working Days: ${totalDays}`);
    doc.text(`Present: ${presentDays} | Absent: ${absentDays} | Late: ${lateDays}`);
    doc.text(`Attendance Percentage: ${attendancePercentage}%`);

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          filename: `Attendance_${student.admissionNumber}_${new Date().toISOString().split('T')[0]}.pdf`,
        });
      });
      doc.on('error', reject);
    });
  }
}

module.exports = new ReportService();
