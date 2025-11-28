from numpy import pi, ones, zeros, uint8, where, cos, sin, sqrt
from cv2 import VideoCapture, cvtColor, Canny, line, imshow, waitKey, destroyAllWindows, COLOR_BGR2GRAY, HoughLinesP
from cv2 import threshold, THRESH_BINARY, dilate, floodFill, circle, HoughLines, erode, rectangle, VideoWriter, VideoWriter_fourcc
from TraceHeader import videoFile, findIntersection, calculatePixels
from CourtMapping import courtMap, showLines, showPoint, heightP, widthP, givePoint
from BodyTracking import bodyMap
from mediapipe import solutions
from BallDetection import BallDetector
from BallMapping import euclideanDistance, withinCircle

# Retrieve video from video file
video = VideoCapture(videoFile)
width = int(video.get(3))
height = int(video.get(4))

fourcc = VideoWriter_fourcc(*'mp4v')
clip = VideoWriter('../Videos/Video.mp4',fourcc,25.0,(widthP,heightP))
processedFrame = None

# Ratios of the crop width, height, and offsets
# If centered is 1, program ignores offset and centers frame
# Optimized crop regions for better player detection
class crop1:
    x: float = 60/100  # Increased from 50% to catch more of player 1
    xoffset: float = 0/100
    xcenter: int = 1 
    
    y: float = 40/100  # Increased from 33% for better coverage
    yoffset: float = 0/100
    ycenter: int = 0
    
class crop2:
    x: float = 80/100  # Slightly reduced from 83% for better centering
    xoffset: float = 0/100
    xcenter: int = 1 
    
    y: float = 65/100  # Increased from 60% for better player 2 coverage
    yoffset: float = 35/100  # Adjusted from 40% for better positioning
    ycenter: int = 0

# Calculations for pixels used in both crops
crop1 = calculatePixels(crop1, width, height)
crop2 = calculatePixels(crop2, width, height)
# Body smoothing, n is number of frames averaged
n = 3
counter = 0

# Player pose decleration 
mp_pose = solutions.pose

class body1:
    pose = mp_pose.Pose(model_complexity=2, min_detection_confidence=0.25, min_tracking_confidence=0.25)
    x: int
    xAvg: float = 0
    y: int
    yAvg: float = 0
    
class body2:
    pose = mp_pose.Pose(model_complexity=2, min_detection_confidence=0.25, min_tracking_confidence=0.25) 
    x: int
    xAvg: float = 0
    y: int
    yAvg: float = 0

# Setting reference frame lines
extraLen = width/3
class axis:
    top = [[-extraLen,0],[width+extraLen,0]]
    right = [[width+extraLen,0],[width+extraLen,height]]
    bottom = [[-extraLen,height],[width+extraLen,height]]
    left = [[-extraLen,0],[-extraLen,height]]

# Setting comparison points
NtopLeftP = None
NtopRightP = None
NbottomLeftP = None
NbottomRightP = None

ball_detector = BallDetector('TrackNet/Weights.pth', out_channels=2)
ballProximity = []
ball = None
lastSeen = None
handPoints = None
flag = [0,0,0,0]
coords = []
minDist1 = height*width
minDist2 = height*width
velocities = []
M = None  # Initialize transformation matrix
frame_count = 0

while video.isOpened():
    ret, frame = video.read()
    if frame is None:
        break
    frame_count += 1
    if frame_count % 100 == 0:
        print(f"Processing frame {frame_count}...")
    
    # Apply filters that removes noise and simplifies image
    gry = cvtColor(frame, COLOR_BGR2GRAY)
    # Optimized threshold - lower value to catch more court lines
    bw = threshold(gry, 140, 255, THRESH_BINARY)[1]
    # Optimized Canny - lower thresholds to detect more edges
    canny = Canny(bw, 50, 150)
    
    # Using hough lines probablistic to find lines with most intersections
    # Lower threshold and minLineLength to detect more lines, larger maxLineGap for broken lines
    hPLines = HoughLinesP(canny, 1, pi/180, threshold=100, minLineLength=50, maxLineGap=20)
    if hPLines is None:
        continue
    intersectNum = zeros((len(hPLines),2))
    i = 0
    for hPLine1 in hPLines:
        Line1x1, Line1y1, Line1x2, Line1y2 = hPLine1[0]
        Line1 = [[Line1x1,Line1y1],[Line1x2,Line1y2]]
        for hPLine2 in hPLines:
            Line2x1, Line2y1, Line2x2, Line2y2 = hPLine2[0]
            Line2 = [[Line2x1,Line2y1],[Line2x2,Line2y2]]
            if Line1 is Line2:
                continue
            if Line1x1>Line1x2:
                temp = Line1x1
                Line1x1 = Line1x2
                Line1x2 = temp
                
            if Line1y1>Line1y2:
                temp = Line1y1
                Line1y1 = Line1y2
                Line1y2 = temp
                
            intersect = findIntersection(Line1, Line2, Line1x1-200, Line1y1-200, Line1x2+200, Line1y2+200)
            if intersect is not None:
                intersectNum[i][0] += 1
        intersectNum[i][1] = i
        i += 1

    # Lines with most intersections get a fill mask command on them
    i = p = 0
    dilation = dilate(bw, ones((5, 5), uint8), iterations=1)
    nonRectArea = dilation.copy()
    intersectNum = intersectNum[(-intersectNum)[:, 0].argsort()]
    max_lines_to_process = min(8, len(intersectNum))
    for hPLine in hPLines:
        x1,y1,x2,y2 = hPLine[0]
        # line(frame, (x1,y1), (x2,y2), (255, 255, 0), 2)
        for p in range(max_lines_to_process):
            if (i==int(intersectNum[p][1])) and (intersectNum[i][0]>0):
                # line(frame, (x1,y1), (x2,y2), (0, 0, 255), 2)
                floodFill(nonRectArea, zeros((height+2, width+2), uint8), (x1, y1), 1) 
                floodFill(nonRectArea, zeros((height+2, width+2), uint8), (x2, y2), 1) 
        i+=1
    dilation[where(nonRectArea == 255)] = 0
    dilation[where(nonRectArea == 1)] = 255
    eroded = erode(dilation, ones((5, 5), uint8)) 
    # Optimized Canny for main line detection
    cannyMain = Canny(eroded, 50, 120)
    
    # Extreme lines found every frame
    xOLeft = width + extraLen
    xORight = 0 - extraLen
    xFLeft = width + extraLen
    xFRight = 0 - extraLen
    
    yOTop = height
    yOBottom = 0
    yFTop = height
    yFBottom = 0
    
    # Initialize line variables
    xOLeftLine = None
    xORightLine = None
    xFLeftLine = None
    xFRightLine = None
    yOTopLine = None
    yOBottomLine = None
    yFTopLine = None
    yFBottomLine = None
    
    # Finding all lines then allocate them to specified extreme variables
    # Lower threshold to detect more lines (was 300, now 150 for better detection)
    hLines = HoughLines(cannyMain, 1, pi/180, 150)
    if hLines is None:
        continue
    for hLine in hLines:
        for rho,theta in hLine:
            a = cos(theta)
            b = sin(theta)
            x0 = a*rho
            y0 = b*rho
            x1 = int(x0 + width*(-b))
            y1 = int(y0 + width*(a))
            x2 = int(x0 - width*(-b))
            y2 = int(y0 - width*(a))
            
            # Furthest intersecting point at every axis calculations done here
            # Use larger bounds for intersection detection
            intersectxF = findIntersection(axis.bottom, [[x1,y1],[x2,y2]], -extraLen*2, 0, width+extraLen*2, height)
            intersectyO = findIntersection(axis.left, [[x1,y1],[x2,y2]], -extraLen*2, 0, width+extraLen*2, height)
            intersectxO = findIntersection(axis.top, [[x1,y1],[x2,y2]], -extraLen*2, 0, width+extraLen*2, height)
            intersectyF = findIntersection(axis.right, [[x1,y1],[x2,y2]], -extraLen*2, 0, width+extraLen*2, height)
            
            if (intersectxO is None) and (intersectxF is None) and (intersectyO is None) and (intersectyF is None):
                continue
            
            if intersectxO is not None:
                if intersectxO[0] < xOLeft:
                    xOLeft = intersectxO[0]
                    xOLeftLine = [[x1,y1],[x2,y2]]
                if intersectxO[0] > xORight:
                    xORight = intersectxO[0]
                    xORightLine = [[x1,y1],[x2,y2]]
            if intersectyO is not None:
                if intersectyO[1] < yOTop:
                    yOTop = intersectyO[1]
                    yOTopLine = [[x1,y1],[x2,y2]]
                if intersectyO[1] > yOBottom:
                    yOBottom = intersectyO[1]
                    yOBottomLine = [[x1,y1],[x2,y2]]
                    
            if intersectxF is not None:
                if intersectxF[0] < xFLeft:
                    xFLeft = intersectxF[0]
                    xFLeftLine = [[x1,y1],[x2,y2]]
                if intersectxF[0] > xFRight:
                    xFRight = intersectxF[0]
                    xFRightLine = [[x1,y1],[x2,y2]]
            if intersectyF is not None:
                if intersectyF[1] < yFTop:
                    yFTop = intersectyF[1]
                    yFTopLine = [[x1,y1],[x2,y2]]
                if intersectyF[1] > yFBottom:
                    yFBottom = intersectyF[1]
                    yFBottomLine = [[x1,y1],[x2,y2]]
            # line(frame, (x1,y1), (x2,y2), (0, 0, 255), 2)
    
    # Check if all required lines were found
    if (xOLeftLine is None or xORightLine is None or xFLeftLine is None or 
        xFRightLine is None or yOTopLine is None or yOBottomLine is None or 
        yFTopLine is None or yFBottomLine is None):
        if frame_count % 50 == 0:
            missing = [name for name, val in [('xOLeftLine', xOLeftLine), ('xORightLine', xORightLine), 
                                               ('xFLeftLine', xFLeftLine), ('xFRightLine', xFRightLine),
                                               ('yOTopLine', yOTopLine), ('yOBottomLine', yOBottomLine),
                                               ('yFTopLine', yFTopLine), ('yFBottomLine', yFBottomLine)] if val is None]
            print(f"Frame {frame_count}: Linee mancanti: {', '.join(missing)}")
        continue
    
    # lineEndpoints = []
    # lineEndpoints.append(xOLeftLine)
    # lineEndpoints.append(xORightLine)
    # lineEndpoints.append(yOTopLine)
    # lineEndpoints.append(yOBottomLine)
    # lineEndpoints.append(xFLeftLine)
    # lineEndpoints.append(xFRightLine)
    # lineEndpoints.append(yFTopLine)
    # lineEndpoints.append(yFBottomLine)
    
    # for i in range(len(lineEndpoints)):
    #     line(frame, (lineEndpoints[i][0][0],lineEndpoints[i][0][1]), (lineEndpoints[i][1][0],lineEndpoints[i][1][1]), (0, 0, 255), 2)
    
    # Top line has margin of error that effects all courtmapped outputs 
    yOTopLine[0][1] = yOTopLine[0][1]+4
    yOTopLine[1][1] = yOTopLine[1][1]+4
    
    yFTopLine[0][1] = yFTopLine[0][1]+4
    yFTopLine[1][1] = yFTopLine[1][1]+4
    
    # Find four corners of the court and display it
    topLeftP = findIntersection(xOLeftLine, yOTopLine, -extraLen, 0, width+extraLen, height)
    topRightP = findIntersection(xORightLine, yFTopLine, -extraLen, 0, width+extraLen, height)
    bottomLeftP = findIntersection(xFLeftLine, yOBottomLine, -extraLen, 0, width+extraLen, height)
    bottomRightP = findIntersection(xFRightLine, yFBottomLine, -extraLen, 0, width+extraLen, height)
    
    # If all corner points are different or something not found, rerun print
    if (not(topLeftP == NtopLeftP)) and (not(topRightP == NtopRightP)) and (not(bottomLeftP == NbottomLeftP)) and (not(bottomRightP == NbottomRightP)):
        # line(frame, topLeftP, topRightP, (0, 0, 255), 2)
        # line(frame, bottomLeftP, bottomRightP, (0, 0, 255), 2)
        # line(frame, topLeftP, bottomLeftP, (0, 0, 255), 2)
        # line(frame, topRightP, bottomRightP, (0, 0, 255), 2)
        
        # circle(frame, topLeftP, radius=0, color=(255, 0, 255), thickness=10)
        # circle(frame, topRightP, radius=0, color=(255, 0, 255), thickness=10)
        # circle(frame, bottomLeftP, radius=0, color=(255, 0, 255), thickness=10)
        # circle(frame, bottomRightP, radius=0, color=(255, 0, 255), thickness=10)
        
        NtopLeftP = topLeftP
        NtopRightP = topRightP
        NbottomLeftP = bottomLeftP
        NbottomRightP = bottomRightP
        
    # else:
        # line(frame, NtopLeftP, NtopRightP, (0, 0, 255), 2)
        # line(frame, NbottomLeftP, NbottomRightP, (0, 0, 255), 2)
        # line(frame, NtopLeftP, NbottomLeftP, (0, 0, 255), 2)
        # line(frame, NtopRightP, NbottomRightP, (0, 0, 255), 2)
        
        # circle(frame, NtopLeftP, radius=0, color=(255, 0, 255), thickness=10)
        # circle(frame, NtopRightP, radius=0, color=(255, 0, 255), thickness=10)
        # circle(frame, NbottomLeftP, radius=0, color=(255, 0, 255), thickness=10)
        # circle(frame, NbottomRightP, radius=0, color=(255, 0, 255), thickness=10)

    # Displaying feet and hand points from bodyMap function
    handPointsPrev = handPoints
    feetPoints, handPoints, nosePoints = bodyMap(frame, body1.pose, body2.pose, crop1, crop2)

    # Try to create processed frame if we have court corners
    if NtopLeftP is not None and NtopRightP is not None and NbottomLeftP is not None and NbottomRightP is not None:
        try:
            processedFrame, M = courtMap(frame, NtopLeftP, NtopRightP, NbottomLeftP, NbottomRightP)
            rectangle(processedFrame, (0,0),(967,1585),(188,145,103),2000)
            processedFrame = showLines(processedFrame)
        except Exception as e:
            if frame_count % 50 == 0:
                print(f"Frame {frame_count}: Errore nel court mapping: {e}")
            processedFrame = None
            M = None

    # Check if we have valid body tracking data
    has_feet = not any(item is None for sublist in feetPoints for item in sublist) if feetPoints else False
    has_hands = not any(item is None for sublist in handPoints for item in sublist) if handPoints else False
    has_nose = not any(item is None for sublist in nosePoints for item in sublist) if nosePoints else False
    
    if (has_feet or has_hands or has_nose) and processedFrame is not None and M is not None:
        # circle(frame, handPoints[0], radius=0, color=(0, 0, 255), thickness=10)
        # circle(frame, handPoints[1], radius=0, color=(0, 0, 255), thickness=10)
        # circle(frame, handPoints[2], radius=0, color=(0, 0, 255), thickness=30)
        # circle(frame, handPoints[3], radius=0, color=(0, 0, 255), thickness=30)

        # circle(frame, feetPoints[0], radius=0, color=(0, 0, 255), thickness=10)
        # circle(frame, feetPoints[1], radius=0, color=(0, 0, 255), thickness=10)
        # circle(frame, feetPoints[2], radius=0, color=(0, 0, 255), thickness=30)
        # circle(frame, feetPoints[3], radius=0, color=(0, 0, 255), thickness=30)
        
        # Prioritizing lower foot y in body average y position
        if feetPoints[0][1] > feetPoints[1][1]:
            lowerFoot1 = feetPoints[0][1]
            higherFoot1 = feetPoints[1][1]
        else:
            lowerFoot1 = feetPoints[1][1]
            higherFoot1 = feetPoints[0][1]
            
        if feetPoints[2][1] > feetPoints[3][1]:
            lowerFoot2 = feetPoints[2][1]
            higherFoot2 = feetPoints[3][1]
        else:
            lowerFoot2 = feetPoints[3][1]
            higherFoot2 = feetPoints[2][1]
        
        # Allocated 75% preference to lower foot y positions
        body1.x = (feetPoints[0][0]+feetPoints[1][0])/2
        body1.y = lowerFoot1*0.8+higherFoot1*0.2

        body2.x = (feetPoints[2][0]+feetPoints[3][0])/2
        body2.y = lowerFoot2*0.8+higherFoot2*0.2
        
        # Body coordinate smoothing
        counter += 1
        coeff = 1. / min(counter, n)
        body1.xAvg = coeff * body1.x + (1. - coeff) * body1.xAvg
        body1.yAvg = coeff * body1.y + (1. - coeff) * body1.yAvg
        body2.xAvg = coeff * body2.x + (1. - coeff) * body2.xAvg
        body2.yAvg = coeff * body2.y + (1. - coeff) * body2.yAvg
        
        # Calculate euclidian distance between average of feet and hand indexes for both players
        circleRadiusBody1 = int(0.65 * euclideanDistance(nosePoints[0], [body1.x, body1.y]))
        circleRadiusBody2 = int(0.6 * euclideanDistance(nosePoints[1], [body2.x, body2.y]))
        
        # Distorting frame and outputting results
        try:
            processedFrame, M = courtMap(frame, NtopLeftP, NtopRightP, NbottomLeftP, NbottomRightP)
            # Create black background
            rectangle(processedFrame, (0,0),(967,1585),(188,145,103),2000)
            processedFrame = showLines(processedFrame)

            processedFrame = showPoint(processedFrame, M, [body1.xAvg,body1.yAvg])
            processedFrame = showPoint(processedFrame, M, [body2.xAvg,body2.yAvg])
        except Exception as e:
            if frame_count % 50 == 0:
                print(f"Frame {frame_count}: Court mapping failed: {e}")
            processedFrame = None
        
        ballPrev = ball
        ball_detector.detect_ball(frame)
        if ball_detector.xy_coordinates[-1][0] is not None:
            ball = ball_detector.xy_coordinates[-1]
            lastSeen = counter
        
        # Draw a circle around both hands for both players
        # circle(frame, (handPoints[0]), circleRadiusBody1, (255,0,0), 2) # left
        circle(frame, (handPoints[1]), circleRadiusBody1, (255,0,0), 2) # right

        # circle(frame, (handPoints[2]), circleRadiusBody2, (255,0,0), 2) # left
        circle(frame, (handPoints[3]), circleRadiusBody2, (255,0,0), 2) # right
        
        if ball is not None:
            circle(frame, ball, 4, (0,255,0), 3)
            circle(frame, ballPrev, 3, (0,255,0), 2)
            
            # If ball location is unique
            if ball is not ballPrev:
                # Find locations where the ball gets closer to the body
                if withinCircle(handPoints[1], circleRadiusBody1, ball):
                    if minDist1>euclideanDistance(handPoints[1], ball):
                        minDist1 = euclideanDistance(handPoints[1], ball)
                        coords.append((ball, givePoint(M, ball), givePoint(M, (body1.x,body1.y)), counter))
                else:
                    minDist1 = circleRadiusBody1
                if withinCircle(handPoints[3], circleRadiusBody2, ball):
                    if minDist2>euclideanDistance(handPoints[3], ball):
                        minDist2 = euclideanDistance(handPoints[3], ball)
                        coords.append((ball, givePoint(M, ball), givePoint(M, (body2.x,body2.y)), counter))
                else:
                    minDist2 = circleRadiusBody2

                # Find locations of ball bounce

                if ball_detector.xy_coordinates[-2][0] is not None:
                    xVelocity = ball[0] - ballPrev[0]
                    yVelocity = (ball[1] - ballPrev[1])*(1+(height-ball[1])*0.4/height)
                    if withinCircle(handPoints[3], circleRadiusBody2, ball) or withinCircle(handPoints[1], circleRadiusBody1, ball):
                        within = True
                    else:
                        within = False
                    velocities.append(([xVelocity,yVelocity], counter, givePoint(M, ball), within))
                        

        # If the previous ball coordinate is close to the current one, remove the previous one
        if len(coords)>=2:
            if euclideanDistance(coords[-1][0], coords[-2][0]) < 200:
                del coords[-2]
        
        # Display hit points
        for i in range(len(coords)):
            circle(frame, coords[i][0], 4, (0,0,255), 4)
    
    # Write processed frame to clip
    if processedFrame is not None:    
        clip.write(processedFrame)
    else:
        # If court detection failed, create a basic frame with just the court lines
        if NtopLeftP is not None and NtopRightP is not None and NbottomLeftP is not None and NbottomRightP is not None:
            try:
                processedFrame, M = courtMap(frame, NtopLeftP, NtopRightP, NbottomLeftP, NbottomRightP)
                rectangle(processedFrame, (0,0),(967,1585),(188,145,103),2000)
                processedFrame = showLines(processedFrame)
                clip.write(processedFrame)
            except:
                pass
    # Commented out for headless execution
    # imshow("Frame", frame)
    # if waitKey(1) == ord("q"):
    #     break

# Last found location of ball should be appended to ball array
if ball is not None and M is not None:
    coords.append((ball, givePoint(M, ball), givePoint(M, ball), lastSeen))

print(f"Total frames processed: {frame_count}")
clip.release()
video.release()
destroyAllWindows()

accelerations = []
for i in range(2,len(velocities)):
    if velocities[i][1]-2 == velocities[i-2][1] and velocities[i-1][3] is False:
        xAcceleration = (velocities[i][0][0]-velocities[i-2][0][0])/2
        yAcceleration = (velocities[i][0][1]-velocities[i-2][0][1])/2
        accelerations.append((int(yAcceleration), velocities[i][1]))
        if abs(yAcceleration) > (height/77):
            for k in range(len(coords)):
                if coords[k][3] > velocities[i-1][1]:
                    coords.insert(k, (velocities[i-1][2], velocities[i-1][2], velocities[i-1][2], velocities[i-1][1]))
                    break
        
# Create inbetween points for the ball points found
# Try to fix the loop later
ballArray = []
if len(coords) > 0:
    while len(coords)>1:
        time = coords[0][3]
        location = [coords[0][1][0],coords[0][2][1]]
        del coords[0]
        timeDiff = coords[0][3]-time
        for i in range(time, coords[0][3]):
            x = int(location[0]+((i-time)/timeDiff)*(coords[0][1][0]-location[0]))
            y = int(location[1]+((i-time)/timeDiff)*(coords[0][2][1]-location[1]))
            ballArray.append(((x,y), i))       

    if len(coords) > 0:
        ballArray.append(((coords[0][1][0], coords[0][2][1]), coords[0][3]))

# Overlay ball information on the previous video
clip = VideoWriter('../Videos/Video1.mp4',fourcc,25.0,(widthP,heightP))
counter = 0
video = VideoCapture('../Videos/Video.mp4')
writeFlag = False
while video.isOpened():
    ret, frame = video.read()
    if frame is None:
        break
    
    counter += 1

    for i in range(len(ballArray)):
        if counter == ballArray[i][1]:
            circle(frame, (ballArray[i][0]), 4,(0,255,255),3)
            break
        
    # for i in range(len(accelerations)):
    #     if counter == accelerations[i][1]:
    #         print(accelerations[i])
    #         break

    if counter == ballArray[0][1]:
        writeFlag = True

    if ballArray[-1][1] == counter:
        writeFlag = False
        
    if (writeFlag):
        index = counter - ballArray[0][1]
        circle(frame, (ballArray[index][0]), 2,(0,255,255),3)
    
    clip.write(frame)

video.release()
clip.release()
destroyAllWindows()