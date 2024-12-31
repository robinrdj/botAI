import React,{useState, useEffect} from 'react';
import './BotAI.css';
import homeImg from "../Assets/homeImg.png";
import userImg from "../Assets/userImg.png";
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { IoThumbsUpOutline } from "react-icons/io5";
import { IoThumbsDownOutline } from "react-icons/io5";
import './BotAI.css';


function ReplyCard({ id,user, message, time, avatar, msgId, pastConversations }){

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [showRating,setShowRating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [localRating,setLocalRating] = useState(0);
  const [localFeedback, setLocalFeedback] = useState("");

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  
  const handleFeedbackChange=(e)=>{
      setFeedback(e.target.value);
  }
  const handleFeedback=()=>{
     localStorage.setItem(`${id}feedback`,feedback);
     handleClose();
  }
  const handleRatingClick=()=>{
    setShowRating(true);
  }

  useEffect(()=>{
    let loFeed = localStorage.getItem(`${id}feedback`)||"";
    let loRating = localStorage.getItem(`${id}rating`)||0;
    if(loFeed!=""){
       setLocalFeedback(loFeed);
    }
    if(loRating!=0){
      console.log(localStorage.getItem(`${id}rating`));
       setLocalRating(loRating);
    }
  },[]);

  return (
    <div className="reply__card">
      <img src={avatar} alt={`${user} avatar`} className="avatar" />
      <div className="message__content">
        <div className="message__header">
          <span className="user__name">{user}</span>
        </div>
        <p className="message__text">{message}</p>
        <div className="message__footer">
          <span className="message__time">{time}</span>
          <div className="reaction__icons">
            {user==="Soul AI" && id===msgId  && pastConversations==false?
            <div>
          <span className="icon" onClick={handleRatingClick}><IoThumbsUpOutline /></span>
          <span className="icon"><IoThumbsDownOutline onClick={handleOpen}/></span>
            </div>:""  
          }
          </div>
        </div>
        {user!=="You" && id===msgId && showRating? 
        <div>
        <Typography component="legend">Rate this response</Typography>
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
            localStorage.setItem(`${id}rating`, newValue);
          }}
        />
        </div>
       :""}
       {pastConversations?
               <div>
                {localFeedback.toString().length>0?<Typography component="legend">Feedback: {localFeedback}</Typography>:""}
                {localRating>0?<Rating
                 name="simple-controlled"
                 value={localRating}
               />:""}
               </div>:""}
      </div>
    
    <div>
      <Modal
        open={open}
        onClose={handleClose}
      >
             <div style={{style}}>
      <div className="feedback__popup">
      <div className="popup__header">
        <div className="icon__and__title">
          <i className="lightbulb__icon">💡</i>
          <span>Provide Additional Feedback</span>
        </div>
        <button className="close__button" onClick={handleClose}>X</button>
      </div>
      <div className="popup__body">
        <textarea
          placeholder="Write your feedback here..."
          className="feedback__textarea"
          rows={6}
          onChange={handleFeedbackChange}
        ></textarea>
      </div>
      <div className="popup__footer">
        <button className="submit__button" onClick={handleFeedback}>Submit</button>
      </div>
    </div>
    </div>
      </Modal>
      </div>
      {pastConversations?<div >
        {rating!==0?   <Rating
          name="simple-controlled"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
            localStorage.setItem(`${id}rating`, newValue);
          }}
        />:""}
        {feedback!=""?feedback:""}
      </div>:""}
    </div>
  );
};


const BotAI = () => {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [qA, setQA] = useState([]);
  const [msgId, setMsgId] = useState(0);
  const [msgList, setMsgList] = useState([]);

  
  const getTime = () => {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetch('../data/data.json')
      .then((response) => response.json())
      .then((data) => {
        setQA(data);
      })
      .catch((error) => {
        console.error('Error fetching the data:', error);
      });
      localStorage.clear();
  }, []);

  
  const handleAsk=(val)=>{
    let currentInput = input;
    if(input==""){
      currentInput = val;
    }
    let currentMsg = { id: msgId+1, user: "You", message: currentInput , time: getTime(), avatar: userImg };
    setMsgs((prev)=>{return [...prev,currentMsg]});
    let found = false;
    for(let i=0;i<qA.length;i++){
      if(qA[i].question===input){
        let newMsg = { id:msgId+2, user: "You", message: qA[i].response, time: getTime(), avatar: homeImg };
        setMsgs((prev)=>{return [...prev,newMsg]});
        found = true;
      }
    }
    if(!found){
      let newMsg= { id: msgId+2, user: "Soul AI", message: "Cant find the answer", time: getTime(), avatar: homeImg };
      setMsgs((prev)=>{return [...prev,newMsg]});
    }
    setInput("");
    setMsgId((prev)=>prev+2);
    console.log(msgs);
  }

  const handleSave=()=>{
    let temp = msgs;
    let currentRating = localStorage.getItem(`${msgId}rating`)||0;
    let currentFeedback = localStorage.getItem(`${msgId}feedback`);
    let currentMsg = {rating:currentRating,feedback:currentFeedback,messages:msgs,date:new Date()};
    console.log(msgList);
    setMsgList((prev)=>{return [...prev,currentMsg]});
    setMsgs([]);
    console.log(msgList);
  }

  const handleInputChange=(e)=>{
     setInput(e.target.value);
  }

  const [showPastConversations, setShowPastConversations] = useState(false);

  const togglePastConversations=()=>{
    setShowPastConversations(true);
  }

  const handleNewChat = ()=>{
    let temp = msgs;
    setMsgList((prev)=>{return [...prev,msgs]});
    setMsgs([]);
    setShowPastConversations(false);
    console.log(msgList);
  }

  const [filterRating, setFilterRating] = useState(0);
  const handleFilterRatingChange = (e)=>{
      setFilterRating(e.target.value);
  }

 const handleTemplateQuestions = (val) =>{
    handleAsk(val);
     setInput(val);
 }
  return (
    <div className="bot__ai__container">
      <div>
      <div className="bot__ai__header">
        <button className="new__chat__button" onClick={handleNewChat}>New Chat</button>
        <button className="past__conversations__button" onClick={togglePastConversations}>Past Conversations</button>
      </div>
      </div>
      {showPastConversations!=true?
     <div>
     <div className="bot__ai__content">
       <h1 className="bot__ai__title">How Can I Help You Today?</h1>
       <div className="bot__ai__icon">
         <img src={homeImg} alt="Bot Icon" />
       </div>
       <div className="bot__ai__questions">
         <div className="question__card" onClick={()=>handleTemplateQuestions("Hi, what is the weather?")}>
           <h3>Hi, what is the weather?</h3>
           <p>Get immediate AI generated response</p>
         </div>
         <div className="question__card" onClick={()=>handleTemplateQuestions("Hi, what is my location?")}>
            <h3>Hi, what is my location?</h3>
           <p>Get immediate AI generated response</p>
           </div>
         <div className="question__card" onClick={()=>handleTemplateQuestions("Hi, what is the temperature?")}>
           <h3>Hi, what is the temperature?</h3>
           <p>Get immediate AI generated response</p>
           </div>
         <div className="question__card" onClick={()=>handleTemplateQuestions("Hi, how are you?")}>
           <h3>Hi, how are you?</h3>
           <p>Get immediate AI generated response</p>
           </div>
       </div>
       {msgs.map((msg) => (        
           <ReplyCard key={msg.id} id={msg.id} user={msg.user}  message={msg.message}  time={msg.time} avatar={msg.avatar} msgId={msgId} pastConversations={false}/>
         ))}
       <Box sx={{ '& > legend': { mt: 2 } }}></Box>
       <div className="bot__ai__input">
         <input type="text" placeholder="Ask" className="ask__input" value={input} onChange={handleInputChange}/>
         <button className="ask__button" onClick={handleAsk}>Ask</button>
         <button className="save__button" onClick={handleSave}>Save</button>
       </div>
     </div>
     </div>:<div className="bot__ai__content">
      <h2>Conversation History</h2>
              <input
          type="number"
          min="0"
          max="5"
          value={filterRating}
          onChange={handleFilterRatingChange}
          placeholder="Enter a rating (0-5)"
          style={{
            width: "110px",
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "3px",
          }}
        />
  {
  msgList.filter((item)=>{return item.rating>=filterRating}).map((msgListItem) => (
    <div key={msgListItem.date}>
      <p>
        date: {msgListItem.date ? new Date(msgListItem.date).toLocaleDateString() : "No date available"}
      </p>
      {msgListItem.messages.map((msg) => (
        <div key={msg.id}>
          <ReplyCard
            key={msg.id}
            id={msg.id}
            user={msg.user}
            message={msg.message}
            time={msg.time}
            avatar={msg.avatar}
            msgId={msgId}
            pastConversations={true}
          />
        </div>
      ))}
    </div>
  ))}
</div>
    }
    </div>
  );
};

export default BotAI;
