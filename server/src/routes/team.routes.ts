import { Router } from 'express';
import { getDepartmentMembers } from '../controllers/team.controller.js';
import {
  sendTeamInvitation,
  getMyInvitations,
  respondToInvitation,
  getMyTeam,
  getUnassignedEmployees,
  updateTeamAssignment
} from '../controllers/team.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { cancelTeamInvitation } from '../controllers/team.controller.js';


const router = Router();

// All team routes require authentication
router.use(authenticate);

// --- INVITATION ROUTES ---
router.post('/invitations', authorize('manager', 'admin'), sendTeamInvitation);
router.get('/invitations', getMyInvitations); // Employee fetches their invites
router.put('/invitations/respond', respondToInvitation); // Employee accepts/rejects
router.post('/invitations/cancel', authorize('manager', 'admin'), cancelTeamInvitation);

// --- TEAM MANAGEMENT ROUTES ---
router.get('/my-team', getMyTeam);
router.get('/unassigned', authorize('manager', 'admin'), getUnassignedEmployees);
router.post('/action', authorize('manager', 'admin'), updateTeamAssignment);
router.get('/department-members', authorize('manager', 'admin'), getDepartmentMembers);

export default router;