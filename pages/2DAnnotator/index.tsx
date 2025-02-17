import React from "react";
import Header from "../header";
import MainAnnotator from "../../component/Layout/mid";
import Categories from "../../component/Layout/PageLeft";
import Position from "../../component/Layout/PageRight";
import { Provider } from "react-redux";
import Grid from "@material-ui/core/Grid";
import { useRouter } from "next/router";
import dataServer, { option } from "../../main_config";
import { connect } from "react-redux";
import DataSet from "../../styles/DataSet.module.css";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import KeyboardVoiceIcon from "@material-ui/icons/KeyboardVoice";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import Button from "@material-ui/core/Button";
import store from "../../redux";
import SaveIcon from "@material-ui/icons/Save";
import Router from "next/router";
import {
  CreateNextFrame,
  CreatePreviousFrame,
} from "../../redux/action/GeneralReducerAction";
import { createSaveToCloudAction } from "../../redux/action/BoundingBoxAction";

interface taskInfo {
  taskid: string;
  sequence: number;
  data: string;
}
const mapDispatchToProps = (dispatch) => ({
  SaveToCloud_through_redux_store: (taskInfo: taskInfo) => {
    dispatch(createSaveToCloudAction(taskInfo));
  },
  nextFrame: () => {
    dispatch(CreateNextFrame());
  },
  previousFrame: () => {
    dispatch(CreatePreviousFrame());
  },
});
const SaveToCloud_through_redud_store_button = connect(
  null,
  mapDispatchToProps
)((props) => {
  const { SaveToCloud_through_redux_store, _taskID, sequence } = props;
  return (
    <Button
      variant="contained"
      color="secondary"
      className={DataSet.sub}
      startIcon={<SaveIcon />}
      onClick={() => {
        SaveToCloud_through_redux_store({
          _taskID: _taskID,
          sequence: sequence,
        });
        Router.push({
          pathname: `/taskdetail/${_taskID}`,
        });
      }}
    >
      保存并退出
    </Button>
  );
});

const mapStatesToProps = (state) => ({
  entireBoundingBox: state.BoundingBoxCollection,
  currentFrameIndex: state.GeneralReducer.currentFrameIndex,
  currentBoundingBoxIndex: state.GeneralReducer.currentBoundingBoxIndex,
  currentDrawMode: state.GeneralReducer.currentDrawMode,
  currentCategory: state.GeneralReducer.currentCategory,
});
const PreviousFrame = connect(
  null,
  mapDispatchToProps
)((props) => {
  const { previousFrame } = props;
  return (
    <Button
      variant="contained"
      color="secondary"
      className={DataSet.pagenet}
      startIcon={<ArrowBackIosIcon />}
      onClick={() => {
        previousFrame();
      }}
    >
      上一页
    </Button>
  );
});
const NextFrame = connect(
  null,
  mapDispatchToProps
)((props) => {
  const { nextFrame } = props;
  return (
    <Button
      variant="contained"
      color="secondary"
      className={DataSet.pagenet}
      endIcon={<ArrowForwardIosIcon />}
      onClick={() => {
        nextFrame();
      }}
    >
      下一页
    </Button>
  );
});
const CurrentFrame = connect(
  mapStatesToProps,
  null
)((props) => {
  return ( <div className={DataSet.numb_list}> {props.currentFrameIndex + 1} / 50</div>);
});
export default function Annotator(props) {
  const router = useRouter();
  const { _taskID, sequence } = router.query;
  // console.log("router.query", router.query);
  var [imageArray, setImageArray] = React.useState([]);
  var [annotationArray, setAnnotationArray] = React.useState([]);
  const concatAddresstoData = (array) => {
    return array.map((value, index) => {
      for (let key in value) {
        value[key] = `${dataServer}${option.getMeterail}${value[key]}`;
      }
      return value;
    });
  };
  React.useEffect(() => {
    const request = () => {
      return new Promise((resolve, reject) => {
        const imageRequest = new XMLHttpRequest();
        imageRequest.open(
          "GET",
          `${dataServer}/${option.getSingleTask}?_id=${_taskID}&index=${sequence}`
        );
        console.log(
          `${dataServer}/${option.getSingleTask}?_id=${_taskID}&index=${sequence}`
        );
        imageRequest.setRequestHeader("Authorization", "bdta");
        imageRequest.withCredentials = true;

        imageRequest.onload = () => {
          const res = JSON.parse(imageRequest.response);
          if (res.status === 1) {
            resolve(res.data);
          } else {
            reject(res.status);
          }
        };
        imageRequest.send();
        // imageRequest.addEventListener("load", ({ target }) => {
        //   let { response } = target;
        //   let parsedData = JSON.parse(response).data;

        //   XMLresult = concatAddresstoData(parsedData);
        //   imageArray = XMLresult.map((object, index) => {
        //     return object.jpg;
        //   });
        //   window.result = XMLresult;
        //   setImageArray(imageArray);
        //   // if (Object.keys(result[0]).includes("json")) {
        //   //   console.log("有标注信息", result[0]["json"])
        //   //   const annotationRequest = new XMLHttpRequest();
        //   //   annotationRequest.open(
        //   //     "GET", result[0]["json"]
        //   //   )
        //   //   annotationRequest.setRequestHeader("Authorization", "bdta");
        //   //   annotationRequest.withCredentials = true;
        //   //   annotationRequest.addEventListener("load", ({ target }) => {
        //   //     let { response } = target;
        //   //     let parsedData = JSON.parse(response)
        //   //     parsedData.forEach(value => {
        //   //    })
        //   //   })
        //   //   annotationRequest.send()
        //   //   // annotationArray = JSON.parse(response).data.map((object, index) => {
        //   //   //   return object.json;
        //   //   // });
        //   //   // annotationArray = annotationArray.map((address) => {
        //   //   //   return `${dataServer}/${option.getMeterail}${address}`;
        //   //   // });
        //   //   // console.log("加载已有标注", annotationArray);
        //   //   // setAnnotationArray(annotationArray);
        //   // }
        // });
      });
    };
    request()
      .then(
        (response) => {
          let addressList = concatAddresstoData(response);
          let imageArray = addressList.map((object, index) => {
            return object.jpg;
          });
          let annotationArray = addressList.map((object, index) => {
            return object.json;
          });
          return { imageArray, annotationArray };
        },
        (err) => {
          console.log("Having Problem", err);
        }
      )
      .then((response) => {
        imageArray = response.imageArray;
        setImageArray(imageArray);
        setAnnotationArray(response.annotationArray);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [router.query]);

  return (
    <Provider store={store}>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ position: "absolute", top: "0px", bottom: "0px" }}
      >
        <div className={DataSet.sheet}>
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <div style={{ flexGrow: "1" }}></div>
            <CurrentFrame />
            <div>
              <SaveToCloud_through_redud_store_button
                _taskID={_taskID}
                sequence={sequence}
              />
            </div>
            <div>
              <PreviousFrame />
            </div>
            <NextFrame />
          </div>
        </div>
        <div style={{ height: "100%", display: "flex" }}>
          <MainAnnotator
            imageList={imageArray}
            annotationArray={annotationArray}
          />
          <Categories />
        </div>
      </Grid>
    </Provider>
  );
}
