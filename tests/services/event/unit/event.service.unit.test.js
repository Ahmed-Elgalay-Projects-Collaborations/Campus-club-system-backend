describe("event.service (unit)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("updateEvent rejects capacity below current attendee count", async () => {
    const eventDoc = {
      _id: "e1",
      attendeeCount: 5,
      capacity: 10,
      date: new Date("2099-01-01T00:00:00.000Z"),
      save: jest.fn(),
    };

    const EventMock = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findById: jest.fn().mockResolvedValue(eventDoc),
      findByIdAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    jest.doMock("../../../../src/models/event.model", () => EventMock);
    jest.doMock("../../../../src/models/rsvp.model", () => ({
      deleteMany: jest.fn(),
    }));
    jest.doMock("../../../../src/utils/transaction", () => ({
      runWithTransactionFallback: jest.fn((work) => work(null)),
    }));

    const service = require("../../../../src/services/event.service");

    await expect(
      service.updateEvent("e1", { capacity: 4 })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "capacity cannot be lower than current attendee count.",
    });
  });

  test("deleteEvent throws 404 when event does not exist", async () => {
    const EventMock = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      findByIdAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    const RSVPModelMock = { deleteMany: jest.fn() };

    jest.doMock("../../../../src/models/event.model", () => EventMock);
    jest.doMock("../../../../src/models/rsvp.model", () => RSVPModelMock);
    jest.doMock("../../../../src/utils/transaction", () => ({
      runWithTransactionFallback: jest.fn((work) => work(null)),
    }));

    const service = require("../../../../src/services/event.service");

    await expect(
      service.deleteEvent("507f1f77bcf86cd799439011")
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Event not found.",
    });
    expect(RSVPModelMock.deleteMany).not.toHaveBeenCalled();
  });
});
