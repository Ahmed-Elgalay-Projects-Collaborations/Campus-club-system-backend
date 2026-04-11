const RSVP = require("../models/rsvp.model");
const ApiError = require("../utils/ApiError");
const eventService = require("./event.service");
const authService = require("./auth.service");
const { normalizePagination, buildPaginationMeta } = require("../utils/pagination");
const { runWithTransactionFallback } = require("../utils/transaction");

const createRsvp = async ({ eventId, userId }) => {
  let createdRsvp = null;
  try {
    await runWithTransactionFallback(async (session) => {
      const findOptions = session ? { session } : {};
      const existing = await RSVP.findOne({ eventId, userId }, null, findOptions);
      if (existing) {
        throw new ApiError(409, "You already RSVP'd to this event.");
      }

      await eventService.reserveSeat(eventId, { session });

      if (session) {
        const [row] = await RSVP.create([{ eventId, userId }], { session });
        createdRsvp = row;
      } else {
        try {
          createdRsvp = await RSVP.create({ eventId, userId });
        } catch (error) {
          await eventService.releaseSeat(eventId);
          throw error;
        }
      }
    });

    return createdRsvp;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "You already RSVP'd to this event.");
    }

    throw error;
  }
};

const cancelRsvp = async ({ eventId, userId }) => {
  let cancelledRsvp = null;
  await runWithTransactionFallback(async (session) => {
    if (session) {
      const rsvp = await RSVP.findOneAndDelete({ eventId, userId }, { session });
      if (!rsvp) {
        throw new ApiError(404, "RSVP not found for this user/event.");
      }

      await eventService.releaseSeat(eventId, { session });
      cancelledRsvp = rsvp;
      return;
    }

    const rsvp = await RSVP.findOneAndDelete({ eventId, userId });
    if (!rsvp) {
      throw new ApiError(404, "RSVP not found for this user/event.");
    }

    try {
      await eventService.releaseSeat(eventId);
      cancelledRsvp = rsvp;
    } catch (error) {
      await RSVP.create({ eventId, userId });
      throw error;
    }
  });

  return cancelledRsvp;
};

const listAttendees = async (eventId, paginationInput = null) => {
  const query = { eventId };
  let rsvps = [];
  let pagination = null;

  if (paginationInput) {
    const normalized = normalizePagination(paginationInput, {
      defaultLimit: 20,
      maxLimit: 100,
    });

    const [rows, total] = await Promise.all([
      RSVP.find(query)
        .sort({ createdAt: 1 })
        .skip(normalized.skip)
        .limit(normalized.limit),
      RSVP.countDocuments(query),
    ]);

    rsvps = rows;
    pagination = buildPaginationMeta({
      total,
      page: normalized.page,
      limit: normalized.limit,
    });
  } else {
    rsvps = await RSVP.find(query).sort({ createdAt: 1 });
  }

  if (rsvps.length === 0) {
    return {
      items: [],
      pagination,
    };
  }

  const userIds = rsvps.map((item) => item.userId);
  const users = await authService.getUsersByIds(userIds);
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return {
    items: rsvps.map((rsvp) => {
      const userIdString = rsvp.userId.toString();
      return {
        rsvpId: rsvp._id.toString(),
        eventId: rsvp.eventId.toString(),
        userId: userIdString,
        rsvpDate: rsvp.createdAt,
        member: userMap.get(userIdString) || null,
      };
    }),
    pagination,
  };
};

const listMyRsvps = async (userId, paginationInput = {}) => {
  const pagination = normalizePagination(paginationInput, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const query = { userId };
  const [rows, total] = await Promise.all([
    RSVP.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    RSVP.countDocuments(query),
  ]);

  return {
    items: rows.map((row) => ({
      ...row,
      _id: row._id.toString(),
      eventId: row.eventId.toString(),
      userId: row.userId.toString(),
    })),
    pagination: buildPaginationMeta({
      total,
      page: pagination.page,
      limit: pagination.limit,
    }),
  };
};

module.exports = {
  createRsvp,
  cancelRsvp,
  listAttendees,
  listMyRsvps,
};
