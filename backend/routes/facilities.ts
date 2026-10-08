import { Router, Response } from 'express';
import { db } from '../database.ts';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';
import { Facility, Review } from '../types.ts';

const router = Router();

// GET /api/facilities
router.get('/', (req, res: Response) => {
  const { search, city, amenity } = req.query;

  let facilities = db.getAllFacilities();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    facilities = facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q)
    );
  }

  if (city && typeof city === 'string') {
    facilities = facilities.filter((f) => f.city.toLowerCase() === city.toLowerCase());
  }

  if (amenity && typeof amenity === 'string') {
    facilities = facilities.filter((f) =>
      f.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
    );
  }

  // Attach courts count
  const withCourtsCount = facilities.map((f) => {
    const courts = db.getCourtsByFacilityId(f.id);
    return {
      ...f,
      courtsCount: courts.length,
    };
  });

  return res.json(withCourtsCount);
});

// GET /api/facilities/:id
router.get('/:id', (req, res: Response) => {
  const { id } = req.params;
  const facility = db.getFacilityById(id);

  if (!facility) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  const courts = db.getCourtsByFacilityId(facility.id);
  const reviews = db.getReviewsByFacilityId(facility.id);

  return res.json({
    ...facility,
    courts,
    reviews,
  });
});

// POST /api/facilities (Admin only)
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, description, address, city, imageUrl, phone, operatingHours, amenities, priceRange } = req.body;

  if (!name || !address || !city) {
    return res.status(400).json({ error: 'Facility name, address, and city are required.' });
  }

  const id = `fac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newFacility: Facility = {
    id,
    name: name.trim(),
    description: description || 'Badminton court facility with modern amenities.',
    address: address.trim(),
    city: city.trim(),
    imageUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    phone: phone || '+91 98450 12345',
    operatingHours: operatingHours || '06:00 AM – 11:00 PM',
    amenities: Array.isArray(amenities) ? amenities : ['BWF Certified Mat', 'Air Conditioning', 'Locker & Showers'],
    rating: 5.0,
    reviewCount: 0,
    priceRange: priceRange || '₹400 - ₹800/hr',
    createdAt: new Date().toISOString(),
  };

  db.createFacility(newFacility);
  return res.status(201).json(newFacility);
});

// PUT /api/facilities/:id (Admin only)
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = db.updateFacility(id, req.body);

  if (!updated) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  return res.json(updated);
});

// DELETE /api/facilities/:id (Admin only)
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteFacility(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  return res.json({ message: 'Facility and associated courts removed successfully.' });
});

// POST /api/facilities/:id/reviews
router.post('/:id/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user!.userId;

  const facility = db.getFacilityById(id);
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  const profile = db.getPlayerProfileByUserId(userId);
  const userName = profile?.name || 'Badminton Player';

  const review: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    facilityId: id,
    userId,
    userName,
    rating: Number(rating),
    comment: (comment || '').trim(),
    createdAt: new Date().toISOString(),
  };

  const created = db.createReview(review);
  return res.status(201).json(created);
});

export default router;
