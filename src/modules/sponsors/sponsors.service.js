const Sponsor = require('../../models/Sponsor');
const Sponsorship = require('../../models/Sponsorship');
const PDFDocument = require('pdfkit');

class SponsorService {
  async createSponsor(data) {
    const sponsor = new Sponsor(data);
    await sponsor.save();
    return sponsor;
  }

  async getSponsors() {
    return Sponsor.find();
  }

  async getSponsorById(id) {
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) throw new Error('Sponsor not found');
    return sponsor;
  }

  async addSponsorshipFund(sponsorId, fundingData) {
    const sponsorship = new Sponsorship({
      sponsorId,
      fundingAmount: fundingData.fundingAmount,
      plantsCount: fundingData.plantsCount,
      allocationDetails: fundingData.allocationDetails,
      notes: fundingData.notes
    });

    await sponsorship.save();

    // Update the sponsor's totals
    await Sponsor.findByIdAndUpdate(sponsorId, {
      $inc: {
        totalFundsContributed: fundingData.fundingAmount,
        totalPlantsFunded: fundingData.plantsCount
      }
    });

    return sponsorship;
  }

  async generateSponsorReport(sponsorId) {
    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor) throw new Error('Sponsor not found');

    const sponsorships = await Sponsorship.find({ sponsorId });

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          let pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        
        // Document generation
        doc.fontSize(25).font('Helvetica-Bold').text('Green Adoption CSR Certificate', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(16).font('Helvetica').text(`This certifies that`, { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(30).font('Helvetica-Bold').fillColor('#2e7d32').text(`${sponsor.companyName}`, { align: 'center' });
        doc.fillColor('black');
        doc.moveDown();
        
        doc.fontSize(14).font('Helvetica').text(`Has generously contributed towards the environmental mission of HP Evergreen Project.`, { align: 'center' });
        doc.moveDown(2);
        
        // Stats
        doc.fontSize(16).font('Helvetica-Bold').text('Contribution Summary:');
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica').text(`Total Funds: INR ${sponsor.totalFundsContributed.toLocaleString()}`);
        doc.text(`Total Trees Funded: ${sponsor.totalPlantsFunded.toLocaleString()}`);
        doc.moveDown(1.5);
        
        // Table of allocations
        if (sponsorships.length > 0) {
          doc.fontSize(16).font('Helvetica-Bold').text('Funding History:');
          doc.moveDown(0.5);
          sponsorships.forEach((fund, index) => {
            doc.fontSize(12).font('Helvetica').text(`${index + 1}. Date: ${fund.dateFunded.toLocaleDateString()} | Amount: INR ${fund.fundingAmount.toLocaleString()} | Trees: ${fund.plantsCount}`);
          });
        }
        
        doc.moveDown(4);
        doc.fontSize(12).font('Helvetica-Oblique').text('Thank you for making the world greener.', { align: 'center' });
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new SponsorService();
