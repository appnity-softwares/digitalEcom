const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUserRole,
    updateUserSubscription,
    deleteUser,
    getUserStats
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin access
router.use(protect, admin);

router.get('/stats', getUserStats);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/subscription', updateUserSubscription);
router.delete('/:id', deleteUser);

module.exports = router;
