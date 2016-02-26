------------------------
Execution Steps
------------------------

1. For windows users using virtual box, install vagrant,  oracle virtualbox, gitbash.
2. Create a new folder named vagrant in any of your drive.
3. Clone the repository available in the github or download the zip files.
4. Do the vagrant up for this repository in the gitbash.
5. Now establish a secure connection with the ubuntu machine using vagrant ssh in gitbash.
6. Move to the QuizRT3 directory inside the ubuntu machine.
7. You need to install Redis server running on your machine as it is being used for different key value operations like
  session maintenance etc
8. Run the  following commands to install necessary modules and redis etc.
  1. sudo npm install --no-bin-links
  2. sudo apt-get update
  3. sudo apt-get install redis-server
9. Run 'npm start' command to run the app.
10. Now app will start.
11. Execute your ip address:<host-port>/ to run the app in your host browser.

------------------
About QuizRT
------------------

Quiz app  is a multi player quiz app where multiple players can select their favorite topics, can create their profile and contest with different contestants from the world to play the quiz  in real time. The users will be ranked according to their scores calculated from the right answers as well as time taken by them to give the answers. Users will also get different badges according to their skills. We have added tournaments also to the existing game where now you can play the game at another level and have a real time competitions with real time competitors.


So Have a Go and Enjoy this App.
Copyright {2016} {NIIT Limited, Wipro Limited}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
