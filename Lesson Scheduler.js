function myFunction() {

    //The programs currently handles new lessons, rescheduled lessons from other instructors, and cancelled lesson. It does NOT handle lessons rescheduled from the same instructor. Also cannot handle multiple lessons booked by the same person at the same time
  
  //Sets up the name of lesson, lessons array, and the number of lessons in seperate variables
  var labelNameString = "newLesson"; //String
  var labelNameOBJ = GmailApp.getUserLabelByName(labelNameString); //GmailLabel
  var lessons = labelNameOBJ.getThreads();
  var numLessons = lessons.length;
  var calendar = CalendarApp.getDefaultCalendar();
  
  
  
    for(var i = 0; i < numLessons; i++){
  
  
    //lessons is a thread array containing all of the emails that schedule lessons
      //.getMessages returns a message array getting all messages in the thread(0 index should be first email)
      //.getPlainBody returns the raw contents of the email+
      //.getFirstMessageSubject gets the subject
    
      var subject = lessons[i].getFirstMessageSubject();//String
      var body = lessons[i].getMessages()[0].getPlainBody();//String
      var splitBody = body.split(' ');//String array, Hello is index 4
  
      var lessonSub;
      var student;
      var lessonMonth;
      var lessonDay;
      var lessonYear;
      var lessonTime;
      var amOrPm;
      var zoomLink;
  
      var createsLesson = false;
  
      if(splitBody[31].includes("Tijuana")){
        delete splitBody[31];
  
        splitBody = splitBody.filter(function( element) {
          return element !== undefined;
        });
      }
  
      //Lesson subject(check for digital music when making new events)
  
      //New Lessons, rescheduled lessons, cancellations
  
      if(subject.includes("New")){
  
        createsLesson = true;
        //if the subject is digital music
        if(splitBody[13] == "Digital"){
          lessonSub = "Digital Music";
          student = splitBody[16] + ' ' + splitBody[17];//Student name
  
          lessonMonth = splitBody[20];
  
          lessonDay = splitBody[21];
          lessonDay = removeComma(lessonDay); //removes comma from end of day
  
          lessonYear = splitBody[22];
          lessonYear = removeComma(lessonYear); //Same here as before
  
          lessonTime = splitBody[23];
  
          amOrPm = splitBody[27];
          amOrPm = removeComma(amOrPm); //Yep nothing new
      
          zoomLink = splitBody[36];        
           }
        //if it isn't, all the indexes - 1
        else{
          lessonSub = splitBody[13];
          student = splitBody[15] + ' ' + splitBody[16];//Student name
  
          lessonMonth = splitBody[19];
  
          lessonDay = splitBody[20];
          lessonDay = removeComma(lessonDay); //removes comma from end of day
  
          lessonYear = splitBody[21];
          lessonYear = removeComma(lessonYear); //Same here as before
  
          lessonTime = splitBody[22];
  
          amOrPm = splitBody[23];
          amOrPm = removeComma(amOrPm); //Yep nothing new
      
          zoomLink = splitBody[35];
        
        }
  
      }
  
      //DOESNT HANDLE DIGITAL MUSIC
      else if(subject.includes("Rescheduled")){
        createsLesson = true;
  
        lessonSub = splitBody[48];
        student = splitBody[10] + ' ' + splitBody[11];
  
        lessonMonth = splitBody[37];
        
        lessonDay = splitBody[38];
        lessonDay = removeComma(lessonDay);
  
        lessonYear = splitBody[39];
        lessonYear = removeComma(lessonYear);
  
        lessonTime = splitBody[40];
  
        amOrPm = splitBody[41];
        amOrPm = removeComma(amOrPm);
  
      //index 54 contains zoom link along with other info. Split on the asterisk to remove other info
  
        zoomLink = splitBody[54].split('*')[0];
      }
      //must be cancellation
      else{
  
        lessonMonth = splitBody[20];
  
        lessonDay = splitBody[21];
        lessonDay = removeComma(lessonDay);
        
        lessonYear = splitBody[22];
        lessonYear = removeComma(lessonYear);
  
        lessonTime = splitBody[23];
  
        amOrPm = splitBody[24];
        amOrPm = removeComma(amOrPm);
  
  
        var lessonBeginDate = new Date(lessonMonth + ' ' + lessonDay + ' ' + lessonYear + ", " + lessonTime);
          var lessonEndDate = new Date(lessonMonth + ' ' + lessonDay + ' ' + lessonYear + ", " + lessonTime);
          
            if(amOrPm == "PM"){
              lessonBeginDate.setHours(lessonBeginDate.getHours() + 12);
              lessonEndDate.setHours(lessonEndDate.getHours() + 12);
          }
          lessonEndDate.setHours(lessonEndDate.getHours() + 1.5);
  
          var toDeleteEventArray = calendar.getEvents(lessonBeginDate, lessonEndDate);
  
          lessonID = toDeleteEventArray[0].getId();
  
  
          var toDeleteEvent = CalendarApp.getEventById(lessonID);
          toDeleteEvent.deleteEvent();
  
      }
   
    //If there is a new lesson to assign or reschedule, then we call createLesson. If there is a cancellation, then we don't do that
    if(createsLesson){
          createLesson(lessonMonth, lessonDay, lessonYear, lessonTime, amOrPm, student, lessonSub, zoomLink);
    }
  
    //removes "new lesson" label from email, can automate the function without duplicate events in my calendar
       lessons[i].removeLabel( labelNameOBJ);
    }
  
  
    function removeComma(input){
      return input.substring(0, input.length - 1)
    }
  }
  
  function createLesson(lessonMonth, lessonDay, lessonYear, lessonTime, amOrPm, student, lessonSub, zoomLink){
    //creates dates for the beginning and end of lesson, deals with AM and PM differences, creates a title, and creates the lesson itself
          var lessonBeginDate = new Date(lessonMonth + ' ' + lessonDay + ' ' + lessonYear + ", " + lessonTime);
          var lessonEndDate = new Date(lessonMonth + ' ' + lessonDay + ' ' + lessonYear + ", " + lessonTime);
            if(amOrPm == "PM"){
              
              lessonBeginDate.setHours(lessonBeginDate.getHours() + 12);
              lessonEndDate.setHours(lessonEndDate.getHours() + 12);
          }
  
          lessonEndDate.setHours(lessonEndDate.getHours() + 1);
  
          var title = "Lesson with: " + student;
  
          CalendarApp.createEvent(title, lessonBeginDate, lessonEndDate, {description: lessonSub, location: zoomLink});
  
  }
  