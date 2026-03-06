import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// All owner routes require owner role
router.use(verifyToken, requireRole('owner'));

// ========================
// PROPERTY MANAGEMENT
// ========================

// Add a new property
router.post(
    '/properties',
    [
        body('property_name').trim().notEmpty().withMessage('Property name is required').escape(),
        body('property_type').isIn(['PG', 'Hostel', 'Apartment', 'Flat']).withMessage('Invalid property type'),
        body('property_email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email').normalizeEmail(),
        body('address_line1').trim().notEmpty().withMessage('Address is required').escape(),
        body('city').trim().notEmpty().withMessage('City is required').escape(),
        body('state').trim().notEmpty().withMessage('State is required').escape(),
        body('pincode').trim().isNumeric().isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits').escape(),
        body('gender').isIn(['coed', 'male', 'female']).withMessage('Invalid orientation')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const ownerId = req.user.id;

            // Check if owner is approved
            const ownerCheck = await pool.query('SELECT name, email, is_approved FROM owners WHERE id = $1', [ownerId]);
            if (!ownerCheck.rows[0]?.is_approved) {
                return res.status(403).json({ message: 'Your account is not yet approved by admin.' });
            }

            const ownerName = ownerCheck.rows[0].name;
            const ownerEmail = ownerCheck.rows[0].email;

            const {
                property_name, property_type, property_email, property_contact,
                address_line1, address_line2, city, state, pincode,
                description, amenities, gender
            } = req.body;

            if (!property_name || !property_type || !address_line1 || !city || !state || !pincode) {
                return res.status(400).json({ message: 'Required fields are missing.' });
            }

            const result = await pool.query(
                `INSERT INTO properties 
        (owner_id, owner_name, owner_email, property_name, property_type, property_email, property_contact,
         address_line1, address_line2, city, state, pincode,
         description, amenities, gender)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
                [
                    ownerId, ownerName, ownerEmail,
                    property_name, property_type, property_email || null, property_contact || null,
                    address_line1, address_line2 || null, city, state, pincode,
                    description || null, JSON.stringify(amenities || []), gender || 'coed'
                ]
            );

            res.status(201).json({ message: 'Property added. Awaiting admin approval.', property: result.rows[0] });
        } catch (err) {
            console.error('POST /properties error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    });

// ========================
// ROOM MANAGEMENT
// ========================

// Add rooms to a property
router.post('/properties/:id/rooms', async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number, sharing_type, price, total_beds } = req.body;

        // Verify ownership and get property/owner info
        const propCheck = await pool.query(
            `SELECT p.owner_id, p.property_name, o.name AS owner_name 
             FROM properties p JOIN owners o ON p.owner_id = o.id 
             WHERE p.id = $1`, [id]
        );
        if (propCheck.rows.length === 0 || propCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Invalid property or unauthorized.' });
        }

        const propertyName = propCheck.rows[0].property_name;
        const ownerName = propCheck.rows[0].owner_name;

        const result = await pool.query(
            `INSERT INTO rooms (property_id, property_name, owner_name, room_number, sharing_type, price, total_beds)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id, propertyName, ownerName, room_number, sharing_type || 1, price || 0, total_beds || sharing_type || 1]
        );

        res.status(201).json({ message: 'Room added successfully', room: result.rows[0] });
    } catch (err) {
        console.error('POST /rooms error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get rooms for a property
router.get('/properties/:id/rooms', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM rooms WHERE property_id = $1 ORDER BY room_number', [id]);
        res.json({ rooms: result.rows });
    } catch (err) {
        console.error('GET /rooms error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a room
router.put('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number, sharing_type, price, total_beds } = req.body;

        // Verify ownership
        const roomProp = await pool.query(
            `SELECT p.owner_id, p.property_name, o.name AS owner_name 
             FROM rooms r JOIN properties p ON r.property_id = p.id 
             JOIN owners o ON p.owner_id = o.id WHERE r.id = $1`, [id]
        );
        if (roomProp.rows.length === 0 || roomProp.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        const result = await pool.query(
            `UPDATE rooms SET room_number = $1, sharing_type = $2, price = $3, total_beds = $4,
             property_name = $5, owner_name = $6
             WHERE id = $7 RETURNING *`,
            [room_number, sharing_type, price, total_beds,
                roomProp.rows[0].property_name, roomProp.rows[0].owner_name, id]
        );

        res.json({ message: 'Inventory updated.', room: result.rows[0] });
    } catch (err) {
        console.error('PUT /rooms error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a room
router.delete('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership and occupancy
        const roomCheck = await pool.query('SELECT r.*, p.owner_id FROM rooms r JOIN properties p ON r.property_id = p.id WHERE r.id = $1', [id]);
        if (roomCheck.rows.length === 0 || roomCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }
        if (roomCheck.rows[0].occupied_beds > 0) {
            return res.status(400).json({ message: 'Cannot delete occupied room. Deactivate tenants first.' });
        }

        await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
        res.json({ message: 'Room removed from inventory.' });
    } catch (err) {
        console.error('DELETE /rooms error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get my properties
router.get('/properties', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, 
                    COUNT(DISTINCT t.id) AS tenant_count,
                    COALESCE(SUM(r.total_beds), 0) AS total_beds,
                    COALESCE(SUM(r.occupied_beds), 0) AS occupied_beds
             FROM properties p
             LEFT JOIN tenants t ON t.property_id = p.id AND t.is_active = true
             LEFT JOIN rooms r ON r.property_id = p.id
             WHERE p.owner_id = $1
             GROUP BY p.id
             ORDER BY p.created_at DESC`,
            [req.user.id]
        );

        res.json({ properties: result.rows });
    } catch (err) {
        console.error('GET /properties error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a property
router.put('/properties/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const propCheck = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [id]);
        if (propCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found.' });
        }
        if (propCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only edit your own properties.' });
        }

        const {
            property_name, property_type, property_email, property_contact,
            address_line1, address_line2, city, state, pincode,
            description, amenities, gender
        } = req.body;

        const result = await pool.query(
            `UPDATE properties SET
        property_name=$1, property_type=$2, property_email=$3, property_contact=$4,
        address_line1=$5, address_line2=$6, city=$7, state=$8, pincode=$9,
        description=$10, amenities=$11, gender=$12
       WHERE id=$13 AND owner_id=$14
       RETURNING *`,
            [
                property_name, property_type, property_email, property_contact,
                address_line1, address_line2, city, state, pincode,
                description, JSON.stringify(amenities || []), gender, id, req.user.id
            ]
        );

        res.json({ message: 'Property updated.', property: result.rows[0] });
    } catch (err) {
        console.error('PUT /properties error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a property
router.delete('/properties/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM properties WHERE id = $1 AND owner_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found or not authorized.' });
        }

        res.json({ message: 'Property deleted.' });
    } catch (err) {
        console.error('DELETE /properties error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ========================
// TENANT MANAGEMENT
// ========================

// Register a new tenant
router.post(
    '/tenants',
    [
        body('name').trim().notEmpty().withMessage('Tenant name is required').escape(),
        body('email').isEmail().normalizeEmail(),
        body('contact').trim().notEmpty().escape(),
        body('property_id').isInt().withMessage('Property ID must be an integer'),
        body('room_id').optional({ checkFalsy: true }).isInt().withMessage('Room ID must be an integer')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const ownerId = req.user.id;

            // Check if owner is approved
            const ownerCheck = await pool.query('SELECT is_approved FROM owners WHERE id = $1', [ownerId]);
            if (!ownerCheck.rows[0]?.is_approved) {
                return res.status(403).json({ message: 'Your account is not yet approved by admin.' });
            }

            const { name, email, password, contact, dob, property_id, room_id } = req.body;

            if (!name || !email || !password || !contact) {
                return res.status(400).json({ message: 'Name, email, password, and contact are required.' });
            }

            // Verify property belongs to this owner
            if (property_id) {
                const propCheck = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [property_id]);
                if (propCheck.rows.length === 0 || propCheck.rows[0].owner_id !== ownerId) {
                    return res.status(403).json({ message: 'Invalid property.' });
                }
            }

            let finalized_room_number = null;
            if (room_id) {
                const roomCheck = await pool.query(
                    'SELECT room_number, occupied_beds, total_beds FROM rooms WHERE id = $1 AND property_id = $2',
                    [room_id, property_id]
                );
                if (roomCheck.rows.length === 0) {
                    return res.status(400).json({ message: 'Invalid room selection.' });
                }
                if (roomCheck.rows[0].occupied_beds >= roomCheck.rows[0].total_beds) {
                    return res.status(400).json({ message: 'Room is already full. Please select a different room.' });
                }
                finalized_room_number = roomCheck.rows[0].room_number;
            }

            // Check if tenant email already exists
            const exists = await pool.query('SELECT id FROM tenants WHERE email = $1', [email]);
            if (exists.rows.length > 0) {
                return res.status(400).json({ message: 'A tenant with this email already exists.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Start transaction to update room occupancy and save tenant
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                const tenantRes = await client.query(
                    `INSERT INTO tenants (name, email, password, contact, dob, owner_id, property_id, room_id, room_number)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING id, name, email, contact, dob, property_id, room_id, room_number, join_date, is_active`,
                    [name, email, hashedPassword, contact, dob || null, ownerId, property_id || null, room_id || null, finalized_room_number]
                );

                if (room_id) {
                    await client.query('UPDATE rooms SET occupied_beds = occupied_beds + 1 WHERE id = $1', [room_id]);
                }

                await client.query('COMMIT');
                res.status(201).json({ message: 'Tenant registered and bed allocated.', tenant: tenantRes.rows[0] });
            } catch (error) {
                await client.query('ROLLBACK');
                // Check for duplicate email in tenants
                if (error.code === '23505') {
                    return res.status(400).json({ message: 'A tenant with this email already exists.' });
                }
                throw error;
            } finally {
                client.release();
            }
        } catch (err) {
            console.error('POST /tenants error:', err);
            res.status(500).json({ message: 'Server error: ' + err.message });
        }
    });


// Get my tenants
router.get('/tenants', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.id, t.name, t.email, t.contact, t.dob, t.room_number, t.join_date, t.is_active, t.created_at,
              p.property_name
       FROM tenants t
       LEFT JOIN properties p ON p.id = t.property_id
       WHERE t.owner_id = $1
       ORDER BY t.created_at DESC`,
            [req.user.id]
        );

        res.json({ tenants: result.rows });
    } catch (err) {
        console.error('GET /tenants error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Deactivate a tenant
router.patch('/tenants/:id/deactivate', async (req, res) => {
    try {
        // Get the tenant's room_id before deactivating
        const tenantInfo = await pool.query(
            'SELECT room_id, is_active FROM tenants WHERE id = $1 AND owner_id = $2',
            [req.params.id, req.user.id]
        );

        if (tenantInfo.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant not found.' });
        }

        if (!tenantInfo.rows[0].is_active) {
            return res.status(400).json({ message: 'Tenant is already deactivated.' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                'UPDATE tenants SET is_active = false WHERE id = $1 AND owner_id = $2',
                [req.params.id, req.user.id]
            );

            // Free up the bed
            if (tenantInfo.rows[0].room_id) {
                await client.query(
                    'UPDATE rooms SET occupied_beds = GREATEST(occupied_beds - 1, 0) WHERE id = $1',
                    [tenantInfo.rows[0].room_id]
                );
            }

            await client.query('COMMIT');
            res.json({ message: 'Tenant deactivated and bed freed.' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('PATCH /tenants deactivate error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Owner dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const ownerId = req.user.id;
        const properties = await pool.query('SELECT COUNT(*) FROM properties WHERE owner_id = $1', [ownerId]);
        const approvedProps = await pool.query('SELECT COUNT(*) FROM properties WHERE owner_id = $1 AND is_approved = true', [ownerId]);
        const tenants = await pool.query('SELECT COUNT(*) FROM tenants WHERE owner_id = $1', [ownerId]);
        const activeTenants = await pool.query('SELECT COUNT(*) FROM tenants WHERE owner_id = $1 AND is_active = true', [ownerId]);

        res.json({
            totalProperties: parseInt(properties.rows[0].count),
            approvedProperties: parseInt(approvedProps.rows[0].count),
            totalTenants: parseInt(tenants.rows[0].count),
            activeTenants: parseInt(activeTenants.rows[0].count),
        });
    } catch (err) {
        console.error('GET /stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
