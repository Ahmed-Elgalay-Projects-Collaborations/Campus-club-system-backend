describe("rsvp.service (unit)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("createRsvp throws duplicate error when RSVP already exists", async () => {
    const RSVPModelMock = {
      findOne: jest.fn().mockResolvedValue({ _id: "existing" }),
      create: jest.fn(),
      findOneAndDelete: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    jest.doMock("../../../../src/models/rsvp.model", () => RSVPModelMock);
    jest.doMock("../../../../src/services/event.service", () => ({
      reserveSeat: jest.fn(),
      releaseSeat: jest.fn(),
    }));
    jest.doMock("../../../../src/services/auth.service", () => ({
      getUsersByIds: jest.fn(),
    }));
    jest.doMock("../../../../src/utils/transaction", () => ({
      runWithTransactionFallback: jest.fn((work) => work(null)),
    }));

    const service = require("../../../../src/services/rsvp.service");

    await expect(
      service.createRsvp({ eventId: "e1", userId: "u1" })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "You already RSVP'd to this event.",
    });
  });

  test("cancelRsvp throws 404 when RSVP is missing", async () => {
    const RSVPModelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      findOneAndDelete: jest.fn().mockResolvedValue(null),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    jest.doMock("../../../../src/models/rsvp.model", () => RSVPModelMock);
    jest.doMock("../../../../src/services/event.service", () => ({
      reserveSeat: jest.fn(),
      releaseSeat: jest.fn(),
    }));
    jest.doMock("../../../../src/services/auth.service", () => ({
      getUsersByIds: jest.fn(),
    }));
    jest.doMock("../../../../src/utils/transaction", () => ({
      runWithTransactionFallback: jest.fn((work) => work(null)),
    }));

    const service = require("../../../../src/services/rsvp.service");

    await expect(
      service.cancelRsvp({ eventId: "e1", userId: "u1" })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "RSVP not found for this user/event.",
    });
  });
});
