import { DataModelLibraryTemplateItem } from '.';

export const ISO15926: DataModelLibraryTemplateItem = {
  name: 'ISO 15926',
  description:
    'ISO 15926 is an international standard for data integration and exchange in the field of industrial automation and engineering. It provides a framework and methodology for representing, integrating, and exchanging data and information throughout the life cycle of industrial facilities, such as oil and gas plants, power plants, and manufacturing plants.',
  category: 'Oil & Gas',
  versions: [
    {
      dml: `"""
@name Activity in schedule
"""
type ActivityInSchedule {
activityToResouceAssignment : [ScheduleResourceAssignment]
"""
point in time when an activity in the schedule finished
"""
actualFinish : FinishTimePoint
"""
point in time when an activity in the schedule started"
"""
actualStart : StartTimePoint
"""
earliest possible point in time when the uncompleted portions of the activity can finish based on the schedule
"""
earlyFinish : FinishTimePoint
"""
earliest possible point in time when the uncompleted portions of the activity can start based on the schedule
"""
earlyStart : StartTimePoint
finishNoLaterThan : FinishTimePoint
lateFinish : FinishTimePoint
lateStart : StartTimePoint
mustFinishOn : FinishTimePoint
mustStartOn : StartTimePoint
"""
to proceed towards completion
"""
progress : Float
startNoEarlierThan : StartTimePoint
startNoLaterThan : StartTimePoint
}

"""
@name Asset
an item of value owned
"""
type Asset {
name: String
ownedBy : Organisation
}

type Discipline {
name : String
code : String
}

interface Location {
name : String
code : String
}

type Area implements Location{
name : String
code : String
}

"""An area of ground on which a town, building, or monument is constructed."""
type Site implements Location {
name : String
code : String
}

type Organisation {
name : String
code : String
}

"""
@rdfs_seeAlso "ISO15926-13, second edition"
A collection of information that are organized as activities scheduled to be executed.
Note 1 to entry: This definition includes all data in a schedule, it does not refer to any report or diagram.
"""
interface Schedule {
progress : Float
}

"""
schedule that is used by a scheduled activity as a reference basis for comparison to monitor and control progress on the scheduled activity
@name Baseline Schedule
"""
type BaselineSchedule implements Schedule {
progress : Float
}

"""
@name Live Schedule
"""
type LiveSchedule implements Schedule {
progress : Float
}

"""
@name Revised Schedule
"""
type RevisedSchedule implements Schedule {
progress : Float
}

"""
@name Schedule activity network
"""
type ScheduleActivityNetwork implements Schedule {
progress : Float
}

"""
@name Schedule level
"""
type ScheduleLevel {
name : String
code : String
}

"""
@name Schedule resource assignment
"""
type ScheduleResourceAssignment {
resourceAssignmentToScheduleResource : [ScheduleResource]
scheduledhours : Float
}


"""
@name Schedule resources
"""
interface ScheduleResource {
id: String
resourceType : String
}

"""
@name Resource Material
"""
type ResourceMaterial implements ScheduleResource {
id: String
resourceType : String
material : String
}
  
"""
@name Resource People
"""
type ResourcePeople implements ScheduleResource {
id: String
resourceType : String
hasKnowledgeAbout : Discipline
}

"""
@name Resource Tool
"""
type ResourceTool implements ScheduleResource {
id: String
resourceType : String
tool : String
}

interface Time {
hasTimeUnit : TimeUnit
}

"""
@name Time duration
"""
type TimeDuration implements Time {
hasTimeUnit : TimeUnit
duration : Float
}


"""
@name Time instant
"""
interface TimeInstant implements Time {
hasTimeUnit : TimeUnit
timeStamp : Timestamp
}

"""
@name Finish Time Point
"""
type FinishTimePoint implements TimeInstant & Time {
hasTimeUnit : TimeUnit
timeStamp : Timestamp
}


"""
@name Start Time Point
"""
type StartTimePoint implements TimeInstant & Time {
hasTimeUnit : TimeUnit
timeStamp : Timestamp
}

"""
@name
"""
type TimeInterval implements Time {
hasTimeUnit : TimeUnit
hasEndTimeInstant : FinishTimePoint 
hasStartTimeInstant : StartTimePoint
}


"""
@name Time scale
"""
interface TimeScale {
id :  String
}

type Calendar implements TimeScale {
id :  String
}

type Clock implements TimeScale {
id :  String
}

"""
@name Time unit
"""
type TimeUnit {
unit : String
}

"""
@name Work pattern
"""
type WorkPattern {
name : String
code : String
}

"""
@name Work pattern assignment
"""
type WorkPatternAssignment {
name : String
code : String
workPattern : WorkPattern
}`,
      version: '1',
      date: new Date('2023-06-03'),
    },
  ],
};
