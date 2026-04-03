const Organization = require('../../models/Organization');
const logger = require('../../config/logger');

class OrganizationsService {
  async createOrganization(data) {
    const existing = await Organization.findOne({ slug: data.slug });
    if (existing) throw new Error('Organization with this slug already exists');

    const org = new Organization(data);
    await org.save();
    return org;
  }

  async getOrganizations(filters = {}) {
    const { page = 1, limit = 10, status, type, search } = filters;
    const query = {};

    if (status) query.status = status;
    if (type) query.organizationType = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const organizations = await Organization.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Organization.countDocuments(query);

    return {
      organizations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getOrganizationById(id) {
    const org = await Organization.findById(id);
    if (!org) throw new Error('Organization not found');
    return org;
  }

  async updateOrganization(id, data) {
    const org = await Organization.findById(id);
    if (!org) throw new Error('Organization not found');

    if (data.slug && data.slug !== org.slug) {
      const existing = await Organization.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) throw new Error('Slug already in use by another organization');
    }

    Object.assign(org, data);
    await org.save();
    return org;
  }

  async deleteOrganization(id) {
    const org = await Organization.findById(id);
    if (!org) throw new Error('Organization not found');
    
    org.status = 'SUSPENDED';
    await org.save();
    return org;
  }
}

module.exports = new OrganizationsService();
