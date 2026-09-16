using Google.Cloud.Firestore;

namespace FitCore.Infrastructure.Firestore;

/// <summary>Every member's data lives under their own document, so a rule of "uid == request.auth.uid" is enough.</summary>
internal static class Paths
{
    public const string Users = "users";
    public const string Foods = "foods";
    public const string CoachLinks = "coachLinks";
    public const string CoachInvites = "coachInvites";

    public static DocumentReference User(FirestoreDb db, string uid) => db.Collection(Users).Document(uid);
    public static CollectionReference Days(FirestoreDb db, string uid) => User(db, uid).Collection("days");
    public static CollectionReference Weights(FirestoreDb db, string uid) => User(db, uid).Collection("weights");
    public static CollectionReference Measures(FirestoreDb db, string uid) => User(db, uid).Collection("measures");
    public static CollectionReference Photos(FirestoreDb db, string uid) => User(db, uid).Collection("photos");
    public static CollectionReference Activities(FirestoreDb db, string uid) => User(db, uid).Collection("activities");
    public static CollectionReference Sessions(FirestoreDb db, string uid) => User(db, uid).Collection("sessions");
    public static CollectionReference ExerciseMemory(FirestoreDb db, string uid) => User(db, uid).Collection("exLast");
    public static DocumentReference Program(FirestoreDb db, string uid) => User(db, uid).Collection("program").Document("current");

    public static string DayId(DateOnly date) => date.ToString("yyyy-MM-dd");
    public static string LinkId(string coachUid, string traineeUid) => $"{coachUid}__{traineeUid}";
}
