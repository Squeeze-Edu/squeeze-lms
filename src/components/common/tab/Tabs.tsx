"use client";

import { useState, useEffect } from "react";
import React from "react";
import styles from "./Tabs.module.css";
import Text from "@/components/Text/Text";
import { useRouter, useSearchParams } from "next/navigation";

interface TabProps {
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  path?: string;
}

interface TabsProps {
  children: React.ReactNode;
  usePath?: boolean;
  hoverActiveColor?: string;
  defaultIndex?: number;
}

function Tab({ children }: TabProps) {
  return (
    <div className={styles.tab}>
      {children}
    </div>
  );
}

function Tabs({ 
  children, 
  usePath = false, 
  hoverActiveColor = "transparent",
  defaultIndex = 0
}: TabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('tab');
  
  const [activeIndex, setActiveIndex] = useState<string | null>(
    usePath ? currentTab : String(defaultIndex)
  );
  
  const tabs = React.Children.toArray(
    children
  ) as React.ReactElement<TabProps>[];

  useEffect(() => {
    if (usePath) {
      setActiveIndex(currentTab);
    }
  }, [currentTab, usePath]);

  useEffect(() => {
    if (usePath && !activeIndex && tabs.length > 0 && tabs[0].props.path) {
      const defaultPath = tabs[0].props.path;
      setActiveIndex(defaultPath);
      
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('tab', defaultPath);
      router.push(`?${newParams.toString()}`);
    }
  }, [activeIndex, tabs, router, searchParams, usePath]);

  const handleTabClick = (path: string | undefined, index: number) => {
    if (usePath && path) {
      setActiveIndex(path);
      
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('tab', path);
      router.push(`?${newParams.toString()}`);
    } else {
      setActiveIndex(String(index));
    }
  };

  const activeTabContent = usePath 
    ? tabs.find(tab => tab.props.path === activeIndex)
    : tabs[Number(activeIndex) || 0];

  return (
    <div className={styles.container}>
      <div className={styles.tabButton}>
        {tabs.map((tab, index) => {
          const isActive = usePath 
            ? activeIndex === tab.props.path 
            : activeIndex === String(index);
            
          return (
            <button
              key={index}
              onClick={() => handleTabClick(tab.props.path, index)}
              className={isActive ? styles.active : ""}
              style={{
                backgroundColor: isActive ? hoverActiveColor : undefined, cursor: 'pointer'
              }}
            >
              {tab.props.icon}
              <Text variant="caption">
                {tab.props.title}
              </Text>
            </button>
          );
        })}
      </div>

      <div className={styles.tabContent}>
        {activeTabContent || tabs[0]}
      </div>
    </div>
  );
}

export { Tab, Tabs };
