namespace FitCore.Domain.Common;

public enum Gender { Male, Female }

public enum Goal { FatLoss, Maintenance, Bulking, Recomp }

/// <summary>Activity level captured at signup; also seeds how many days a week the program starts with.</summary>
public enum ActivityLevel { Light, Moderate, High }

public enum MassUnit { Kg, Lb }

public enum LengthUnit { Cm, In }

public enum MealSlot { Breakfast, Lunch, Snack, Dinner }

/// <summary>How a session is measured: the iron is counted in sets, everything else in minutes.</summary>
public enum ActivityUnit { Session, Minutes }

public static class WeekDays
{
    /// <summary>Index 0 is Saturday — the week starts on Saturday in the Gulf.</summary>
    public const int Count = 7;

    public static readonly string[] Arabic =
        { "السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة" };

    public static readonly string[] English =
        { "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" };

    /// <summary>Maps a .NET DayOfWeek onto the Saturday-first index used across the app.</summary>
    public static int IndexOf(DayOfWeek day) => ((int)day + 1) % 7;

    public static DateTime StartOfWeek(DateTime nowUtc)
    {
        var date = nowUtc.Date;
        return date.AddDays(-IndexOf(date.DayOfWeek));
    }
}
