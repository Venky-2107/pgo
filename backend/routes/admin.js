import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken, requireRole('admin'));

// ========================
// DASHBOARD STATS
// ========================
router.get('/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM owners) as total_owners,
                (SELECT COUNT(*) FROM owners WHERE is_approved = true) as approved_owners,
                (SELECT COUNT(*) FROM owners WHERE is_approved = false) as pending_owners,
                (SELECT COUNT(*) FROM properties) as total_properties,
                (SELECT COUNT(*) FROM properties WHERE is_approved = true) as approved_properties,
                (SELECT COUNT(*) FROM tenants) as total_tenants,
                (SELECT COUNT(*) FROM tenants WHERE is_active = true) as active_tenants
        `);

        const s = stats.rows[0];
        res.json({
            totalOwners: parseInt(s.total_owners),
            approvedOwners: parseInt(s.approved_owners),
            pendingOwners: parseInt(s.pending_owners),
            totalProperties: parseInt(s.total_properties),
            approvedProperties: parseInt(s.approved_properties),
            totalTenants: parseInt(s.total_tenants),
            activeTenants: parseInt(s.active_tenants),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ========================
// OWNERS MANAGEMENT
// ========================

// Get all owners with their tenant counts
router.get('/owners', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        o.id, o.name, o.email, o.contact, o.is_approved, o.created_at,
        COUNT(DISTINCT p.id) AS property_count,
        COUNT(DISTINCT t.id) AS tenant_count
      FROM owners o
      LEFT JOIN properties p ON p.owner_id = o.id
      LEFT JOIN tenants t ON t.owner_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
        res.json({ owners: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve an owner
router.patch('/owners/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE owners SET is_approved = true WHERE id = $1 RETURNING id, name, email, is_approved',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        res.json({ message: 'Owner approved successfully.', owner: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject (un-approve) an owner
router.patch('/owners/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE owners SET is_approved = false WHERE id = $1 RETURNING id, name, email, is_approved',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        res.json({ message: 'Owner rejected.', owner: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ========================
// PROPERTIES MANAGEMENT
// ========================

// Get all properties with owner info
router.get('/properties', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        p.*,
        o.name AS owner_name,
        o.email AS owner_email,
        COUNT(t.id) AS tenant_count
      FROM properties p
      JOIN owners o ON o.id = p.owner_id
      LEFT JOIN tenants t ON t.property_id = p.id AND t.is_active = true
      GROUP BY p.id, o.name, o.email
      ORDER BY p.created_at DESC
    `);
        res.json({ properties: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve a property
router.patch('/properties/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE properties SET is_approved = true WHERE id = $1 RETURNING id, property_name, is_approved',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found.' });
        }

        res.json({ message: 'Property approved.', property: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject a property
router.patch('/properties/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE properties SET is_approved = false WHERE id = $1 RETURNING id, property_name, is_approved',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found.' });
        }

        res.json({ message: 'Property rejected.', property: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ========================
// TENANTS (view all)
// ========================
router.get('/tenants', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        t.id, t.name, t.email, t.contact, t.room_number, t.join_date, t.is_active, t.created_at,
        o.name AS owner_name,
        p.property_name
      FROM tenants t
      JOIN owners o ON o.id = t.owner_id
      LEFT JOIN properties p ON p.id = t.property_id
      ORDER BY t.created_at DESC
    `);

        res.json({ tenants: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
