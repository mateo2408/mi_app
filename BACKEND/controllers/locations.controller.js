const Country = require('../models/Country');
const Province = require('../models/Province');
const City = require('../models/City');

const listCountries = async (_req, res) => {
  const countries = await Country.find().sort({ name: 1 }).lean();
  return res.json(countries);
};

const listProvinces = async (req, res) => {
  const { countryId } = req.query;
  if (!countryId) return res.status(400).json({ message: 'countryId is required' });
  const provinces = await Province.find({ country: countryId }).sort({ name: 1 }).lean();
  return res.json(provinces);
};

const listCities = async (req, res) => {
  const { provinceId } = req.query;
  if (!provinceId) return res.status(400).json({ message: 'provinceId is required' });
  const cities = await City.find({ province: provinceId }).sort({ name: 1 }).lean();
  return res.json(cities);
};

module.exports = { listCountries, listProvinces, listCities };
