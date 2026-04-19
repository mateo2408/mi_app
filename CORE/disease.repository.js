const Disease = require('../BACKEND/models/Disease');
class DiseaseRepository {
    async findById(id) { return await Disease.findById(id).lean(); }
    async findAll() { return await Disease.find().lean(); }
}
module.exports = new DiseaseRepository();