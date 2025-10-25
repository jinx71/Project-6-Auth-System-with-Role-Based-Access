const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listUsers, updateRole, deleteUser, updateProfile } = require('../controllers/userController');

router.use(authenticate);

// Any signed-in role can update their own profile
router.patch('/me', updateProfile);

// VIEWER gets read-only access to the user list; ADMIN can mutate
router.get('/', authorize('ADMIN', 'VIEWER'), listUsers);
router.patch('/:id/role', authorize('ADMIN'), updateRole);
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;
