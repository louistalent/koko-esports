import React, { useState, useEffect, useRef } from "react";
import { FlatList, KeyboardAvoidingView, Text, View } from "react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import styles from "./styles";
import * as reduxChatActions from "../../../../../redux/actions/chatActions";
import ChatBackButton from "../../../../../components/chat/ChatBackButton";
import ChatMessageComposer from "../../../../../components/chat/ChatMessageComposer";
import ChatMessage from "../../../../../components/chat/ChatMessage";
import { ChatType } from "../../../../../consts/chatConfig";

import { GO_TO_STORE, REFRESH_CHAT_MESSAGES } from "../../../../../events/types";
import { getUserInfo } from "../../../../../redux/selectors";
import { ChatMessageDataType, ChatThreadDataType } from "../../../../../@types/spec";
import EventBus from "react-native-event-bus";

interface ChatRoomScreenProps {
  thread: ChatThreadDataType
  chatActions: any
  onBack: any
  me: any
}

const ChatRoomScreen = ({thread, chatActions, onBack, me}: ChatRoomScreenProps) => {
  const [messages, setMessages] = useState<ChatMessageDataType[]>([]);
  const ref = useRef<FlatList>(null);

  useEffect(() => {
    loadChatData();
    EventBus.getInstance().addListener(REFRESH_CHAT_MESSAGES, (data: any) => {
      if (data.thread === thread.threadID) {
        loadChatData();
      }
    });
  }, []);

  const loadChatData = () => {
    chatActions.setThreadReadAt(thread.threadID);
    chatActions.fetchChatThreadMessages(thread.threadID, onThreadMessagesSuccess, onThreadMessagesFail);
  };

  const onThreadMessagesSuccess = (messages: ChatMessageDataType[]) => {
    setMessages(messages);
  };

  const onThreadMessagesFail = (error: any) => {

  };

  const onBackPress = () => {
    chatActions.setThreadReadAt(thread.threadID);
    onBack();
  };

  const onSendMessage = (message: string) => {
    chatActions.sendMessage(thread.threadID, message, me, ChatType.Room, onSendMessageSuccess);
  };

  const onSendMessageSuccess = (message: ChatMessageDataType) => {
    const newMessages = [message, ...messages];
    setMessages(newMessages);
    chatActions.fetchChatThreads(ChatType.Room);
    ref?.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const renderMessageItem = (item: any) => {
    return <ChatMessage message={item.item} />;
  }

  const renderSeparator = () => {
    return <View style={styles.messageSeparator}/>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <ChatBackButton style={styles.back} onPress={onBackPress}/>
        <Text style={styles.title}>{thread.name}</Text>
      </View>
      <KeyboardAvoidingView style={styles.keyboardAvoidView} behavior={'position'}>
        <FlatList
          ref={ref}
          data={messages}
          style={styles.messageList}
          renderItem={renderMessageItem}
          ItemSeparatorComponent={renderSeparator}
          showsVerticalScrollIndicator={false}
          inverted={true}
          showsHorizontalScrollIndicator={false} />
        <ChatMessageComposer onSend={onSendMessage}/>
      </KeyboardAvoidingView>
    </View>
  );
};

const mapStateToProps = (state: any) => {
  return {
    me: getUserInfo(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    chatActions: bindActionCreators(reduxChatActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomScreen);
