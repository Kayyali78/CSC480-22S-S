import { useEffect } from 'react';
import '../../components/styles/FinalGrade.css';
import '../../pages/StudentPages/styles/AssignmentPageStyle.css'
import '../../components/StudentComponents/AssignmentPage/RegularAssignmentComponent.css'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SubmittedAssBarComponent from '../../components/SubmittedAssBarComponent';
import { getSubmittedAssignmentDetailsAsync } from '../../redux/features/submittedAssignmentSlice';
import uuid from 'react-uuid';
import {base64StringToBlob} from "blob-util";
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import NavigationContainerComponent from "../../components/NavigationComponents/NavigationContainerComponent";
function ProfessorSubmittedAssignmentPage() {
  const dispatch = useDispatch();
  const { currentSubmittedAssignment, currentSubmittedAssignmentLoaded } =
    useSelector((state) => state.submittedAssignments);
  const { courseId, assignmentId, teamId } = useParams();

  useEffect(() => {
    dispatch(
      getSubmittedAssignmentDetailsAsync({ courseId, assignmentId, teamId })
    );
  }, [assignmentId, courseId, dispatch, teamId]);

  const downloadFile = (blob, fileName) => {
    const fileURL = URL.createObjectURL(blob);
    const href = document.createElement('a');
    href.href = fileURL;
    href.download = fileName;
    href.click();
  };

  const onTemplateClick = async (fileName) => {
    if(fileName.endsWith(".pdf")){
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.peer_review_template_data.data)], {type: 'application/pdf'}), fileName)
    }else if(fileName.endsWith(".docx")){
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.peer_review_template_data.data)], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}), fileName)
    }else{
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.peer_review_template_data.data)], {type: 'application/zip'}), fileName)
    }
  };

  const onRubricFileClick = async (fileName) => {
    if(fileName.endsWith(".pdf")){
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.rubric_data.data)], {type: 'application/pdf'}), fileName)
    }else if(fileName.endsWith(".docx")){
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.rubric_data.data)], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}), fileName)
    }else{
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.rubric_data.data)], {type: 'application/zip'}), fileName)
    }
  };

  const onTeamFileClick = async (fileName) => {
    if(fileName.endsWith(".pdf")){
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.submission_data.data)], {type: 'application/pdf'}), fileName)
    }else if(fileName.endsWith(".docx")){
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.submission_data.data)], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}), fileName)
    }else{
      downloadFile(new Blob([Uint8Array.from(currentSubmittedAssignment.submission_data.data)], {type: 'application/zip'}), fileName)
    }
  }

  const prepareFeedbackFile = (feedbackDataName, feedbackData) => {
    var filename = ""
    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    var matches = filenameRegex.exec(feedbackDataName);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
    feedbackData.then((res) => {
      if(filename.endsWith(".pdf")){
        downloadFile(base64StringToBlob(res, 'application/pdf'), filename)
      }else{
        downloadFile(base64StringToBlob(res, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), filename)
      }
    })
  };


  const onFeedBackClick = async (teamName) => {
    const url = `${process.env.REACT_APP_URL}/peer-review/assignments/${courseId}/${assignmentId}/${teamName}/${teamId}/download`;

    await axios
        .get(url, { responseType: 'blob' })
        .then((res) => prepareFeedbackFile(res["headers"]["content-disposition"], res.data.text()))
        .catch((e) => {
          alert(`Error : ${e.response.data}`);
        });
  };


  return (
    <div className="page-container">
      <HeaderBar/>
      <div className='scp-container'>
        <NavigationContainerComponent/>
        <div className='scp-component'>
          <div>
            {currentSubmittedAssignmentLoaded ? (
                <div className='sac-parent'>
                  <h2 className='team-name'>
                    {currentSubmittedAssignment.team_name} Submission
                  </h2>
                  <div className='sac-content'>
                    <div className='ass-tile-content' >
                      <span className='inter-24-bold'> {currentSubmittedAssignment.assignment_name} </span>
                      <span className='inter-20-medium span1-ap'>
                        Due: {currentSubmittedAssignment.due_date}
                      </span>
                      <br /> <br /> <br />
                      <p className='inter-20-medium' >Instructions:</p>
                      <p className='inter-16-medium-black'>{currentSubmittedAssignment.instructions}</p>
                      <br />
                      <br />
                      <span className='inter-20-bold'> Rubric: </span>
                      <span className='inter-16-bold-blue p2' >
                        <button className='blue-button-small' onClick={onRubricFileClick} >
                          {' '}
                          Rubric{' '}
                        </button>
                      </span>
                      <span className='inter-16-bold-blue p2' >
                        <button className='blue-button-small' onClick={onTemplateClick} >
                          {' '}
                          Template{' '}
                        </button>
                      </span>
                      <span className='inter-16-bold-blue p2' >
                        <button className='blue-button-small'>
                          {' '}
                          Team Download{' '}
                        </button>
                      </span>
                    </div>
                    <br />
                    <div>
                      <div>
                        <span className='sac-title'> Peer reviews: </span>
                        <div className='peerReviewList'>
                          {currentSubmittedAssignment.peer_reviews !== null
                              ? currentSubmittedAssignment.peer_reviews.map(
                                  (peerReview) =>
                                      peerReview && (
                                          <li
                                              key={uuid()}
                                              className='psa-peerReviewListItem'
                                          >
                                            <b> {peerReview.reviewed_by} </b>
                                            <div>
                                        <span>
                                          {' '}
                                          {peerReview.grade === -1
                                              ? 'Pending'
                                              : peerReview.grade}{' '}
                                        </span>
                                              &nbsp;
                                              <span
                                                  className='psa-sac-filename'
                                                  onClick={() =>
                                                      onFeedBackClick(
                                                          peerReview.reviewed_by,
                                                          peerReview.submission_name
                                                      )
                                                  }
                                              >
                                          View feedback
                                        </span>
                                            </div>
                                          </li>
                                      )
                              )
                              : null}
                        </div>
                      </div>
                    </div>
                    <br />
                    <br />
                    <div>
                      <span className='sac-title'>
                        {' '}
                        Grade: {currentSubmittedAssignment.grade}
                      </span>
                    </div>
                  </div>
                </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessorSubmittedAssignmentPage;
