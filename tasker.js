var tasker = (function() {
   var verbs = ["make", "install", "update", "generate data for", "talk to", "schedule a time for", "develop a plan for", "knit", "create", "build", "write", "get", "finish", "call", "arrange", "submit", "talk to", "do", "protest", "collect", "shop for"];
   var nouns = ["a cake", "the boat", "our wedding", "the garage", "the tow truck", "our shed", "1090 tax form", "the IRS agent", "milk", "some LED lights", "monthly budget", "marketing plan", "the flowers", "an albatross"];
   var userNames = ["user test", "frodo baggins", "gandalf gray", "smaug dragon"];

   var Task = function (id, ownerId, desc, due, color, complete) {
      this.ownerId = ownerId;
      this.desc = desc;
      this.due = due;
      this.color = color;
      this.complete = complete;
      this.id = id || randomId();
   };

   var randomId = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
         var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
         return v.toString(16);
      });
   }

   var randomColor = function () {
      var pad = function( v ) {
         return v.length == 1 ? '0' + v : v;
      }
      r = Math.floor(Math.random() * 256).toString(16);
      g = Math.floor(Math.random() * 256).toString(16);
      b = Math.floor(Math.random() * 256).toString(16);
      return '#' + pad(r) + pad(g) + pad(b);
   }

   var randomDate = function () {
      year = Math.floor(Math.random() * 14 + 2005);
      month = Math.floor(Math.random() * 12);
      day = Math.floor(Math.random() * 31);
      return new Date(year, month, day);
   };

   var choose = function (things) {
      var i = Math.floor(Math.random() * things.length);
      return things[i];
   }

   var randomDescription = function () {
      return choose(verbs) + ' ' + choose(nouns);
   };

   var makeList = function (ownerId, n) {
      result = [];
      for (i = 0 ; i < n ; i += 1) {
         result.push( new Task( null,
                                ownerId,
                                randomDescription(),
                                randomDate(),
                                randomColor(),
                                choose( [true, false] ) ) );
      }
      return result;
   }

   var state = {
      users : userNames.reduce( function( acc, cv ) {
         var parts = cv.split(' '); //
         var name = parts[0];
         var email = parts[0][0] + parts[1] + '@uwlaxer.edu';
         var id = randomId();
         var password = parts[1];
         var tasks = makeList( id, Math.random() * 50 + 20 ).reduce( (acc, t) => {acc[t.id] = t; return acc; }, {} );
         acc[ id ] = {
            name : name,
            email : email,
            id : id,
            password : password,
            tasks : tasks
         };
         return acc;
      }, {} ),
      user : null
   };

   var getTask = function( ownerId, id ) {
      try {
         return state.users[ownerId].tasks[ id ];
      } catch(e) {
         return null;
      }
   }

   var getUserByName = function( name ) {
      for( id in state.users ) {
         if( state.users[id] && state.users[id].name === name ) {
            return state.users[id];
         }
      }
      return null;
   }

   var taskList = function( ownerId ) {
      var result = [];
      for( var tid in state.user.tasks ) {
         result.push( state.user.tasks[tid] );
      }
      return result.sort( (a,b) => b.due.getTime() - a.due.getTime() );
   }

   return {
      login : function( name, passwd, cb ) {
         var user = getUserByName( name );
         if( user && user.password === passwd ) {
            state.user = user;
            var cleansedUser = { name : user.name, email : user.email, id : user.id };
            window.setTimeout( () => cb( cleansedUser, null ), Math.random() * 1500 );
         } else {
             var timeoutId = window.setTimeout( () => cb( null, 'forbidden'), Math.random() * 1500 );
         }
      },

      logout : function( cb ) {
         state.user = null;
         setTimeout( () => cb( true, null ), Math.random() * 1500 );
      },

      tasks : function( ownerId, cb ) {
         var f;
         if( ownerId === state.user.id ) {
            f = function() { cb( taskList(ownerId).map( u => new Task( u.id, u.ownerId, u.desc, u.due, u.color, u.complete )), null ); };
         } else {
            f = function() { cb( null, 'forbidden'); };
         }
         setTimeout( f, Math.random() * 1500 );
      },

      add : function( ownerId, task, cb ) {
         var f;
         if( state.user.id == ownerId ) {
            if( task.desc && task.due && task.color ) {
               var due = new Date( task.due );
               var task =  new Task( task.id, ownerId, task.desc, due, task.color, Boolean( task.complete ) );
               state.users[ownerId].tasks[ task.id ] = task;
               f = function() { cb( task, null); };
            } else {
               f = function() { cb( null, 'invalid task' ); };
            }
         } else {
            f = function() { cb( null, 'forbidden'); };
         }
         setTimeout( f, Math.random() * 1500 );
      },

      delete : function( ownerId, taskId, cb ) {
         var f;
         if( state.user.id === ownerId ) {
            f = function() { var task = state.users[ownerId].tasks[taskId]; delete state.users[ownerId].tasks[taskId]; cb( task ? task : null, task ? null : 'no such task' ); };
         } else {
            f = function() { cb( null, 'forbidden'); };
         }
         setTimeout( f, Math.random() * 1500 );
      },

      edit : function( ownerId, taskId, task, cb ) {
         var f;
         if( state.user.id == ownerId ) {
            if( taskId ) {
               var oldTask = getTask( ownerId, taskId );
               if( oldTask ) {
                  if( task.hasOwnProperty('desc') ) {
                     oldTask.desc = task.desc;
                  }

                  if( task.hasOwnProperty('due') ) {
                     oldTask.due = task.due;
                  }

                  if( task.hasOwnProperty('color') ) {
                     oldTask.color = task.color;
                  }

                  if( task.hasOwnProperty('complete') ) {
                     oldTask.complete = task.complete;
                  }

                  f = function() { cb( oldTask, null ) };
               } else {
                  f = function() { cb( null, 'no such task' ); };
               }
            } else {
               f = function() { cb( null, 'invalid task.' ); };
            }
         } else {
            f = function() { cb( null, 'forbidden'); };
         }
         setTimeout( f, Math.random() * 1500 );
      }
   }

})();
