const prisma = require('../lib/prisma');

const VALID_ROLES = ['ADMIN', 'USER', 'VIEWER'];

const shape = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  avatarUrl: u.avatarUrl,
  provider: u.googleId ? 'google' : 'password',
  createdAt: u.createdAt
});

// ADMIN + VIEWER can list; only ADMIN can mutate (enforced in routes)
const listUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ success: true, data: { users: users.map(shape) }, message: 'OK' });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, data: null, message: `role must be one of ${VALID_ROLES.join(', ')}` });
    }
    if (id === req.user.id) {
      return res.status(400).json({ success: false, data: null, message: 'You cannot change your own role' });
    }

    const user = await prisma.user.update({ where: { id }, data: { role } });
    // Force re-login so the new role takes effect immediately
    await prisma.refreshToken.deleteMany({ where: { userId: id } });

    res.json({ success: true, data: { user: shape(user) }, message: `Role set to ${role}` });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, data: null, message: 'User not found' });
    }
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ success: false, data: null, message: 'You cannot delete your own account here' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, data: null, message: 'User deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, data: null, message: 'User not found' });
    }
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body || {};
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, data: null, message: 'Name must be at least 2 characters' });
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() }
    });
    res.json({ success: true, data: { user: shape(user) }, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, updateRole, deleteUser, updateProfile };
